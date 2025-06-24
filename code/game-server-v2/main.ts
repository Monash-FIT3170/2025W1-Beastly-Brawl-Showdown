import { GameServer } from "./GameServer";
import * as readline from "readline";
import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import connectDb from "./db/db";
import { GameServerRegisterModel, IGameServerRegisterEntry } from "./db/models";
import { log_attention, log_event, log_notice, log_warning } from "../shared/utils";
import { Player } from "./Player";
import { RoomPhase, PlayerChannelAuth, RoomId, HostChannelAuth } from "../shared/types";
import { Room } from "./Room";
import { ByeMatch, DuelMatch, Match } from "./Match";
import fs from "fs";

// import { HostSocketData, PlayerSocketData } from "./types";

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

  log_notice("Start websocket server...");
  const expressApp = express();
  expressApp.use(cors()); // Allow cross-origin requests
  expressApp.use(express.json()); // Allow cross-origin requests

  const httpServer = http.createServer(expressApp);
  const socketServer = new Server(httpServer, { cors: { origin: "*" } });

  const playerChannel = socketServer.of("/player");
  const hostChannel = socketServer.of("/host");

  const socketToRoom = new Map<string, number>();

  log_notice("Websockets server started.");
  log_notice("Connect to database...");
  connectDb();
  log_notice("Register to global records...");
  const existingRecordCount = await GameServerRegisterModel.countDocuments({
    serverNumber: config.serverNumber,
  });
  if (existingRecordCount > 0) {
    console.log(`Exsting records found with server number <${config.serverNumber}>: ${existingRecordCount}`);
    if (!config.overrideExistingRecordOnStartup) {
      throw new Error("A record already exists, room could not be registered.");
    }
  }
  const updatedRecord = await GameServerRegisterModel.findOneAndUpdate<IGameServerRegisterEntry>(
    { serverNumber: config.serverNumber },
    {
      serverNumber: config.serverNumber,
      serverUrl: config.serverIp.toString() + ":" + config.serverPort.toString(),
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
  log_notice("New Record:\n" + JSON.stringify(updatedRecord));
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

  hostChannel.use((socket, next) => {
    log_event(`Host attempted to join with ${JSON.stringify(socket.handshake.auth)}`);
    const auth = socket.handshake.auth as HostChannelAuth;
    // TODO for now always accept the host name
    // if (!auth.hostName) {
    //   next(new Error("No host name provided."));
    //   return;
    // }

    next();
  });

  //#region Host Events
  // TODO use a persistent ID rather than socket ID
  hostChannel.on("connection", async (socket: Socket) => {
    log_event(`Host connected: ${socket.id}. Binding listeners...`);

    socket.on("disconnect", () => log_event("Host disconnected."));

    //#region <<< New Room
    socket.on(RequestNewRoom.name, RequestNewRoom);
    function RequestNewRoom(): void {
      log_event(`Host ${socket.id}`);
      // TODO prevent multiple rooms at the same time
      try {
        const { roomId: roomId, joinCode: joinCode } = gameServer.createRoom(socket.id);

        socket.emit("request-room_response", {
          roomId: roomId,
          joinCode: joinCode,
        });
        log_notice(`Room generated. id = ${roomId}, join code = ${joinCode}`);
        socket.data.room = gameServer.rooms.get(roomId);
      } catch {
        socket.emit("error", "Could not create room.");
      }

      log_event(`Socket #${socket.id} can start accepting users.`);
    }
    //#endregion

    //#region <<< Start Game
    socket.on(RequestStartGame.name, RequestStartGame);
    /** Host has requested to start game */
    function RequestStartGame(): void {
      const room = socket.data.room as Room;
      if (!room) {
        socket.emit("error", "This host has not been assigned a room.");
        return;
      }

      log_notice(`Socket ${socket.id} requested game start for room #${room.roomId}.`);

      //* Notify everyone in this room
      room.players.forEach((player) => {
        //* Send players to monster selection screen
        playerChannel.to(player.socketId).emit("game-started");
      });

      log_notice("All players informed of start.");
    }
  });

  /// Pre-connection auth check
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

  // Serve match log files
  expressApp.get("/match-log/:roomId/:round/:matchIndex", (req, res) => {
    const { roomId, round, matchIndex } = req.params;
    const filePath = `match_logs/room_${roomId}_round_${round}_match_${matchIndex}.json`;

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Failed to read match log at ${filePath}:`, err.message);
        return res.status(404).send("Match log not found");
      }

      try {
        const json = JSON.parse(data);
        res.json(json);
      } catch (parseError) {
        console.error("Invalid JSON in match log");
        res.status(500).send("Invalid match log format");
      }
    });
  });


  playerChannel.use((socket, next) => {
    log_event(`Player attempted to join with ${JSON.stringify(socket.handshake.auth)}`);
    const auth = socket.handshake.auth as PlayerChannelAuth;

    if (!auth.joinCode) {
      socket.emit("error", "No join code");
      return;
    }
    if (!auth.displayName) {
      socket.emit("error", "No display name");
      return;
    }

    const roomId = gameServer.translateJoinCodeToRoomId(auth.joinCode);
    if (!gameServer.hasRoom(roomId)) {
      log_event("Joined with invalid join code");
      next(new Error("Invalid credentials"));
      return;
    }

    try {
      gameServer.joinRoom(socket.id, roomId, auth.displayName, undefined, undefined);
    } catch (err) {
      if (err instanceof Error) {
        log_warning("Join room failed unexpectedly.\n" + err.message);
        log_attention(gameServer.rooms.get(roomId)?.players);
      } else {
        log_attention("Unexpected error is not of error type.");
      }
      next(new Error("Invalid credentials"));
    }

    log_event(`Join code <${auth.joinCode}> is valid. From <${auth.displayName}>. Socket id = ${socket.id}`);
    const playerNameList = [...gameServer.rooms.get(roomId)?.players.values()!].map((player) => player.displayName);
    console.log("Update player list", playerNameList, "to", gameServer.rooms.get(roomId)!.hostSocketId);
    hostChannel.to(gameServer.rooms.get(roomId)!.hostSocketId).emit("player-set-changed", playerNameList);

    // Create new player and add it to the correct gameserver room
    const newPlayer = new Player(roomId, socket.id, auth.displayName);
    gameServer.rooms.get(roomId)?.players.set(auth.displayName, newPlayer);
    log_notice(`Player ${auth.displayName} assigned to room ${roomId}`);

    socket.data.player = newPlayer;
    socketToRoom.set(socket.id, roomId);
    next();
  });

  playerChannel.on("connection", async (socket: Socket) => {
    log_event(`Player connected: ${socket.id}. Binding listeners...`);

    socket.on("disconnect", () => log_event("Player disconnected."));

    // Checks for what action the player chose.
    socket.on('playerAction', (move: any) => {
      // Prints actions chosen.
      console.log("Move submitted:", JSON.stringify(move));


      // Looks through every room and every player in that room to see
      // if the player that pressed that button is in that room.
      for (const [roomId, room] of gameServer.rooms) {

        // Iterate over all players in this room
        for (const [playerId, player] of room.players) {

          // Check if this is the player who sent the move
          if (player.socketId === move.playerSocket) {
            const selectedPlayer: Player = player;
            const match = room.playerToMatch.get(selectedPlayer);

            // Checks to see if the there is a match for the player. 
            // Stupid ah Javascript >:c.
            if (match instanceof DuelMatch) {

              // Checks to see which side the player is on
              if (match.sides[0].player = selectedPlayer) {
                match.sides[0].pendingMove = move.action;
              }
              else {
                match.sides[1].pendingMove = move.action;
              }

              // Checks to see if both players have chosen an action.
              if (match.sides[0].pendingMove != null && match.sides[1].pendingMove != null) {

                const [monster1, monster2] = match.CalculateBattle();

              }

            } else {
              console.warn("No match found for player", selectedPlayer);
            }
          }
        }

      }

    });


    //#region <<< Submit Move
    socket.on(RequestSubmitMove.name, RequestSubmitMove);

    function ForwardSelectedMove(): void { }

    function RequestSubmitMove(move: any): void {
      // TODO type
      console.log("Move submitted: ", JSON.stringify(move));

      // TODO turn stuff
      // for that match and for this player, store the desired move for that turn

      // TODO if all users in that match submitted and a turn can be processed
      if (false) {
        // resolve the turn
        // // const TEMP_playerSocketId = "sdfgrdfgrdgfrdfg";
        // // playerChannel
        // //   .to(TEMP_playerSocketId)
        // //   .emit("turn-result", "PLACEHOLDER RESULT");
        // idk do something to mark a new turn or however u do it
        // emit the output of the turn to both players (i.e updated state of the monsters)
        // if winner idk yet
      }
    }
    //#endregion

    //#region <<< Monster Select
    socket.on(RequestSubmitMonster.name, RequestSubmitMonster);

    function RequestSubmitMonster(data: any): void {
      const player = socket.data.player as Player;
      if (!player) {
        socket.emit("error", "This player has not been initiated.");
        return;
      }

      const room = gameServer.rooms.get(player.roomId);
      if (!room) {
        socket.emit("error", "500 Internal Server Error");
        return;
      }

      player.setMonster(data.data);
      player.isReadyForGame = true;
      console.log(`Player ${player.displayName} is ready with monster:`, player.monster);

      // Check if all players are ready
      const allReady = Array.from(room.players.values()).every((p) => p.isReadyForGame);
      if (!allReady) {
        log_notice("Waiting for all players to submit their monsters...");
        return;
      }

      // Now that everyone is ready: generate next round
      room.generateNextRound();
      const round = room.matches.length;

      for (let i = 0; i < room.matches[round - 1].length; i++) {
        const match = room.getMatch(round - 1, i);

        if (match instanceof ByeMatch) {
          const byePlayer = match.player;
          playerChannel.to(byePlayer.socketId).emit("round-start-bye", {});
          continue;
        }

        if (match instanceof DuelMatch) {
          const [side1, side2] = match.sides;
          const player1 = side1.player;
          const player2 = side2.player;

          // Save match log
          const logData = {
            roomId: room.roomId,
            round,
            matchIndex: i,
            player1: {
              name: player1.displayName,
              monster: player1.monster,
            },
            player2: {
              name: player2.displayName,
              monster: player2.monster,
            },
          };

          const logDir = "match_logs";
          fs.mkdirSync(logDir, { recursive: true });
          const filePath = `${logDir}/room_${logData.roomId}_round_${round}_match_${i}.json`;
          fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));
          log_notice(`Wrote match log to ${filePath}`);

          // Emit round-start to both players
          console.log(`Emitting round-start to players in room ${room.roomId}, round ${round}, match ${i}:`);
          console.log(`→ Player 1: ${player1.displayName}, Socket ID: ${player1.socketId}`);
          console.log(`→ Player 2: ${player2.displayName}, Socket ID: ${player2.socketId}`);

          playerChannel.to(player1.socketId).emit("round-start", {
            roomId: room.roomId,
            round,
            matchIndex: i,
          });
          playerChannel.to(player2.socketId).emit("round-start", {
            roomId: room.roomId,
            round,
            matchIndex: i,
          });

          continue;
        }

        log_attention("Unknown match type encountered during round start.");
      }

      hostChannel.emit("round-start", {}); // Optional: Inform spectators or host
    }

    //#endregion
  });

  //#endregion
  httpServer.listen(config.serverPort, () => {
    log_notice(`Socket.IO server running on ${config.serverIp.toString() + ":" + config.serverPort.toString()}. <CTRL+C> to shutdown.`);

    //#region IO
    // Readline setup
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

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
    //#endregion
  });
}

//#region TEMP
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
//#endregion

//#region START
main(config);
//#endregion
