import { GameServer } from "./gameServer";
import * as readline from "readline";
import http from "http";
import { Server, Socket } from "socket.io";
import { getRandomPool, log_attention, log_event, log_notice, log_warning } from "./utils";
import * as fs from "fs";
import * as path from "path";
import { Player } from "./player";
import { SideId } from "../simulator/core/side";
import { COMMON_MONSTER_POOL } from "../simulator/data/common/common_monster_pool";
import { TargetingMethod } from "../simulator/core/action/targeting";
import { Match, MatchType } from "./match";
import { TournamentType } from "./tournament_manager";
import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GameServerRegistryModel } from "./models/game_server_register";

const MONGO_IP = "localhost";
const MONGO_PORT = "27017";
const MONGO_NAME = "RoomLocation";
const MONGO_URI = `mongodb://${MONGO_IP}:${MONGO_PORT}/${MONGO_NAME}`;

async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    return mongoose;
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
}

type ServerConfig = {
  serverIp: string;
  serverPort: number;
  serverNumber: number;
  maxCapcity: number;
  overrideExistingRecordOnStartup: boolean;
};

async function main(config: ServerConfig) {
  //#region Startup
  log_notice("Starting server...");
  log_notice("Connect to database...");
  try {
    const db = await connectToDatabase();
    db.connection.on("disconnect", () => {
      console.error("ERROR: Mongo disconnected...");
      process.exit(1);
    });
    log_notice("Connected to mongo.");
    try {
      const _docSizeAtStartup = await GameServerRegistryModel.countDocuments();
      console.log("Current collection size:", _docSizeAtStartup);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  } catch (error) {
    log_attention("MongoDB connection error: " + error);
    process.exit(1);
  }

  log_notice("Start websocket server...");
  const expressApp = express();
  expressApp.use(cors()); // Allow cross-origin requests
  expressApp.use(express.json()); // Allow cross-origin requests

  const httpServer = http.createServer(expressApp);
  const socketServer = new Server(httpServer, { cors: { origin: "*" } });

  const playerChannel = socketServer.of("/player");
  const hostChannel = socketServer.of("/host");

  log_notice("Websockets server started.");

  log_notice("Register to global records...");
  try {
    const record = await GameServerRegistryModel.findOne();

    const existingRecordCount = await GameServerRegistryModel.countDocuments({
      serverNumber: config.serverNumber,
    });
    if (existingRecordCount > 0) {
      log_warning(`Exsting records found with server number <${config.serverNumber}>: ${existingRecordCount}`);
      if (!config.overrideExistingRecordOnStartup) {
        throw new Error("A record already exists, room could not be registered.");
      }
    }
    const updatedRecord = await GameServerRegistryModel.findOneAndUpdate(
      { serverNumber: config.serverNumber },
      {
        serverNumber: config.serverNumber,
        serverUrl: config.serverIp.toString() + ":" + config.serverPort.toString(),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    log_notice("New Record:\n" + JSON.stringify(updatedRecord));
  } catch (e) {
    log_attention("ERR: Failed to register this server. " + e);
    process.exit(1);
  }
  log_notice("Registered to records.");

  log_notice("Starting game service...");
  const gameServer = new GameServer(config.serverNumber, config.maxCapcity);

  log_notice("Server set up complete.");
  //#endregion

  //#region Events
  log_notice("Register events and start listening...");
  log_notice("Attatching events...");
  socketServer.on("connection", async (socket: Socket) => {
    log_event(`User connected with id: ${socket.id}`);

    //#region Standard
    socket.on("disconnect", () => {
      log_event("User disconnected.");
    });

    socket.on("ping", () => {
      log_event(`pong`);
      socket.emit("pong");
    });

    socket.on("echo", async (msg) => {
      log_event(`Echoing: ${msg}`);
      socket.emit("echo", msg);
    });

    //#endregion
    /*
    socket.on("message", async (msg) => {
      log_event(`Received: ${msg}`);
      socket.emit("serverResponse", `Recieved: ${msg}`);
    });
    */
  });

  // #region Host Channel
  type HostChannelAuth = {
    // hostName: string;
  };
  hostChannel.use((socket, next) => {
    log_event(`Host attempted to join with ${JSON.stringify(socket.handshake.auth)}`);
    const auth = socket.handshake.auth as HostChannelAuth;
    /// for now always accept the host name
    // if (!auth.hostName) {
    //   next(new Error("No host name provided."));
    //   return;
    // }

    next();
  });

  // TODO use a persistent ID rather than socket ID
  hostChannel.on("connection", async (socket: Socket) => {
    log_event(`Host connected: ${socket.id}`);

    socket.on("disconnect", () => {
      log_event("Host disconnected.");
    });

    // #region New Room
    socket.on("request-room", async (data: { type: "standard" | "random" }) => {
      log_event("Room requested with mode: " + data.type);
      // TODO prevent multiple rooms at the same time
      try {
        const { roomId: roomId, joinCode: joinCode } = gameServer.createRoom(socket.id, playerChannel);

        // Set tournament type in the room
        const room = gameServer.rooms.get(roomId);
        if (room) {
          room.tournamentManager.tournamentType =
            data.type === "random"
              ? TournamentType.Random
              : TournamentType.Standard;
        }

        socket.emit("request-room_response", { roomId, joinCode });
        log_notice(
          `Room generated. id = ${roomId}, join code = ${joinCode}, mode = ${data.type}`
        );      } catch {
        socket.emit("error", "Could not create room.");
      }
    });

    // #region Start Game
    socket.on("start-game", (msg: { roomId: number }) => {
      log_event(`Host requested start-game for room ${msg.roomId}`);

      const room = gameServer.rooms.get(msg.roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      // Relay to all players in this room
      room.players.forEach((player) => {
        let pool: string[];
        if (room.tournamentManager.tournamentType === TournamentType.Random) {
          pool = getRandomPool(3); // Random mode
          log_event("Random Pool: ");
          console.log(pool);
        } else {
          pool = Object.keys(COMMON_MONSTER_POOL.monsters).filter(
            (k) => k !== "blank"
          ); // Standard mode, exclude BlankMon
        }

        player.currentMonsterPool = pool;
        playerChannel.to(player.socketId).emit("select-monster", { monsterPool: pool }); // Clients can now start monster selection
      });

      log_notice(`All players in room ${msg.roomId} have been notified to start the game.`);
    });
  });

  /// Pre-connection auth check
  type PlayerChannelAuth = {
    joinCode: string;
    displayName: string;
  };
  expressApp.post("/player-auth-precheck", (req, res) => {
    log_event("Player is prechecking auth\n" + JSON.stringify(req.body));

    const checkResult: {
      isJoinCodeValid: boolean | null;
      isDisplayNameValid: boolean | null;
    } = {
      isJoinCodeValid: null,
      isDisplayNameValid: null,
    };

    if (!req.body) {
      log_notice(`Player auth check result:\n${JSON.stringify(checkResult)}`);
      res.send(checkResult);
      return;
    }

    if (!req.body.joinCode) {
      checkResult.isJoinCodeValid = false;
      log_notice(`Player auth check result:\n${JSON.stringify(checkResult)}`);
      res.send(checkResult);
      return;
    }

    const roomId = gameServer.translateJoinCodeToRoomId(req.body.joinCode);
    checkResult.isJoinCodeValid = gameServer.hasRoom(roomId);

    if (!req.body.displayName) {
      checkResult.isDisplayNameValid = false;
      log_notice(`Player auth check result:\n${JSON.stringify(checkResult)}`);
      res.send(checkResult);
      return;
    }
    checkResult.isDisplayNameValid = !gameServer.rooms.get(roomId)?.hasPlayer(req.body.displayName);

    log_notice(`Player auth check result:\n${JSON.stringify(checkResult)}`);
    res.send(checkResult);
  });

  playerChannel.use((socket, next) => {
    log_event(`Player attempted to join with ${JSON.stringify(socket.handshake.auth)}`);
    const auth = socket.handshake.auth as PlayerChannelAuth;

    if (!auth.joinCode) {
      socket.emit("error", "No join code");
      next(new Error("Invalid credentials"));
      return;
    }
    if (!auth.displayName) {
      socket.emit("error", "No display name");
      next(new Error("Invalid credentials"));
      return;
    }

    const roomId = gameServer.translateJoinCodeToRoomId(auth.joinCode);
    if (!gameServer.hasRoom(roomId)) {
      log_event("Joined with invalid join code");
      next(new Error("Invalid credentials"));
      return;
    }

    try {
      gameServer.joinRoom(socket.id, roomId, auth.displayName, undefined);

      // Attach the actual player instance to the socket
      const room = gameServer.rooms.get(roomId);
      const player = room?.getPlayer(auth.displayName);
      if (player) {
        socket.data.player = player;
      }
    } catch (err) {
      if (err instanceof Error) {
        log_warning("Join room failed unexpectedly.\n" + err.message);
        log_attention(gameServer.rooms.get(roomId)?.players);
      } else {
        log_attention("Unexpected error is not of error type.");
      }
      next(new Error("Invalid credentials"));
      return;
    }

    log_event(`Join code <${auth.joinCode}> is valid. From <${auth.displayName}>. Socket id = ${socket.id}`);

    const playerNameList = gameServer.rooms.get(roomId)?.players.map((player) => player.displayName) ?? [];

    console.log("Update player list", playerNameList, "to", gameServer.rooms.get(roomId)!.hostSocketId);
    console.log("Player socket: ", socket.data);

    hostChannel.to(gameServer.rooms.get(roomId)!.hostSocketId).emit("player-set-changed", playerNameList);
    next();
  });

  // #region Player Channel
  playerChannel.on("connection", async (socket: Socket) => {
    log_event(`Player connected: ${socket.id}`);

    socket.on("disconnect", () => {
      log_event("Player disconnected.");
    });

    // #region Select Monster
    socket.on("RequestSubmitMonster", (data: any) => {
      const player = socket.data.player as Player;
      if (!player) return;

      const room = gameServer.rooms.get(player.roomId);
      if (!room) return;

      // Expect the client to send the monster templateId (key)
      const monsterKey = data.data.monsterTemplate as keyof typeof COMMON_MONSTER_POOL.monsters;
      log_event(`Player selected monster key: ${monsterKey}`);

      // Validate selection
      if (room.tournamentManager.tournamentType === TournamentType.Random) {
        if (!player.currentMonsterPool?.includes(monsterKey)) {
          log_warning(`Invalid monster selection by ${player.displayName}`);
          socket.emit("error", "Invalid monster selection");
          return;
        }
      } else {
        if (!COMMON_MONSTER_POOL.monsters[monsterKey]) {
          log_warning(`Invalid monster selection by ${player.displayName}`);
          socket.emit("error", "Invalid monster selection");
          return;
        }
      }

      // Store selected monster template name directly
      player.setMonsterTemplate(monsterKey);
      player.isReady = true;
      log_event(`Player ${player.displayName} selected ${player.selectedMonsterTemplateName}`);

      // Resolve promise if random tournament, 2nd round onwareds
      if (data.data.selections > 1) {
        log_attention("Not the first monster selection, resolving promise...");
        room.tournamentManager.resolveMonsterSelection(player, monsterKey);
      }

      // Check if all players are ready
      let allReady;
      if (data.data.selections == 1) {
        // Read from all players in room
        log_notice("Reading ready from all players");
        allReady = Array.from(room.players.values()).every(
          (p) => p.isReady
        );
      } else { // Read from winners only
        log_notice("Reading ready from winners");
        allReady = Array.from(room.tournamentManager.winners.values()).every(
          (p) => p.isReady
        );
      }
      if (!allReady) {
        log_notice("Waiting for all players to submit their monsters...");
        return;
      }

      // All players ready, start tournament if first selection
      if (data.data.selections == 1) {
        log_warning(`Only start the tournament once. The number of monster selections is: ${data.data.selections}`);
        room.tournamentManager.startTournament(Array.from(room.players.values()));

        room.tournamentManager.matches.forEach((match: Match) => {
          if (match.matchType == MatchType.BYE) {
            log_notice("This match is a bye");
            room.playerChannel.to(match.player1.socketId).emit("send-to-waiting", {bye: true});
            return; //TODO HANDLE BYE
          }

          // P1: send a copy/start
          room.playerChannel.to(match.player1.socketId).emit("round-start", {
            myMonster: match.player1.selectedMonsterTemplateName,
            enemyMonster: match.player2?.selectedMonsterTemplateName, // not option if bye
            sideID: 0,
          });

          //P2: send a copy/start (invert sides?)
          room.playerChannel.to(match.player2?.socketId).emit("round-start", {
            myMonster: match.player2?.selectedMonsterTemplateName,
            enemyMonster: match.player1.selectedMonsterTemplateName,
            sideID: 1, 
          });
        });
      }
    });

    function handleRollNotice() {
      log_notice("Roll notice is being handled");
      const player = socket.data.player as Player;
      const room = gameServer.rooms.get(player.roomId!);
      if (!room) return;
      const match = room.tournamentManager.matches.find((m) => m.player1 === player || m.player2 === player);
      if (!match) return;

      match.submitRoll(player);
    }

    socket.on("requestRoll", handleRollNotice);

    // #region Submit Move
    socket.on("RequestSubmitMove", (msg: { data: any }) => {
      log_event("Test move submission log");
      const { moveId, targetMethod } = msg.data;

      const player = socket.data.player as Player;
      const room = gameServer.rooms.get(player.roomId!);
      if (!room) return;

      const match = room.tournamentManager.matches.find((m) => m.player1 === player || m.player2 === player);
      if (!match) return;
      const [player1, player2] = [match.player1, match.player2];

      const sourceSide = match.getSideForPlayer(player);
      player.submittedMove = true;

      switch (moveId) {
        case "defend":
          match.submitMove(player, moveId, targetMethod as TargetingMethod, sourceSide as SideId);
          break;
        case "attack-normal":
          const targetSide = sourceSide === 1 ? 0 : 1;
          match.submitMove(player, moveId, targetMethod as TargetingMethod, targetSide as SideId);
          break;
      }

      const allSubmitted = player1.submittedMove && player2?.submittedMove;

      if (allSubmitted) {
        [player1.submittedMove, player2.submittedMove] = [false, false];

        // Prepare move data for client
        const player1Move = match.getPlayerMove(player1); // or store last submitted move somewhere
        const player2Move = match.getPlayerMove(player2);

        // Send both moves to the clients
        playerChannel.to(player1.socketId).emit("ExecuteTurn", {
          playerMove: player1Move,
          enemyMove: player2Move,
        });
        playerChannel.to(player2.socketId).emit("ExecuteTurn", {
          playerMove: player2Move,
          enemyMove: player1Move,
        });

        playerChannel.to(player1.socketId).emit("UnlockButton");
        playerChannel.to(player2.socketId).emit("UnlockButton");
      }
    });
  });

  httpServer.listen(config.serverPort, () => {
    log_notice(`Socket.IO server running on ${config.serverIp.toString() + ":" + config.serverPort.toString()}. <CTRL+C> to shutdown.`);
    //#endregion

    //#region IO
    // Readline setup
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const READY_FILE_PATH = path.join(__dirname, "server_ready.flag");

    // After server is initialized:
    log_notice("Ready file made");

    // Signal readiness
    fs.writeFileSync(READY_FILE_PATH, "READY");

    // Listen for Ctrl + C (SIGINT)
    const listenForShutdown = () => {
      process.on("SIGINT", () => {
        log_attention("Gracefully shutting down...");

        rl.close(); // Close input interface
        socketServer.close(); // Close Socket.IO
        httpServer.close(() => {
          log_attention("Server closed.");
          process.exit(0); // Exit process
        });
      });
    };

    // Start listening
    listenForShutdown();
  });
}

log_notice("Loading config...");
log_attention("Config not implemented yet. Using placeholder.");
const config: ServerConfig = {
  serverIp: "http://localhost",
  serverPort: 8080,
  serverNumber: 7,
  maxCapcity: 12,
  overrideExistingRecordOnStartup: true,
};
log_notice("Config loaded.");

main(config);
