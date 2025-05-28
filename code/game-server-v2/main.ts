import { GameServer } from "./GameServer";
import * as readline from "readline";
import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import connectDb from "./db/db";
import { GameServerRegisterModel, IGameServerRegisterEntry } from "./db/models";
import { log_attention, log_event, log_notice, log_warning } from "./utils";

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

  log_notice("Websockets server started.");
  log_notice("Connect to database...");
  connectDb();
  log_notice("Register to global records...");
  const existingRecordCount = await GameServerRegisterModel.countDocuments({
    serverNumber: config.serverNumber,
  });
  if (existingRecordCount > 0) {
    console.log(
      `Exsting records found with server number <${config.serverNumber}>: ${existingRecordCount}`
    );
    if (!config.overrideExistingRecordOnStartup) {
      throw new Error("A record already exists, room could not be registered.");
    }
  }
  const updatedRecord =
    await GameServerRegisterModel.findOneAndUpdate<IGameServerRegisterEntry>(
      { serverNumber: config.serverNumber },
      {
        serverNumber: config.serverNumber,
        serverUrl:
          config.serverIp.toString() + ":" + config.serverPort.toString(),
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

  type HostChannelAuth = {
    // hostName: string;
  };
  hostChannel.use((socket, next) => {
    log_event(
      `Host attempted to join with ${JSON.stringify(socket.handshake.auth)}`
    );
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

    socket.on("request-room", async () => {
      log_event("Room requested.");
      // TODO prevent multiple rooms at the same time
      try {
        const { roomId: roomId, joinCode: joinCode } = gameServer.createRoom(
          socket.id
        );

        socket.emit("request-room_response", {
          roomId: roomId,
          joinCode: joinCode,
        });
        log_notice(`Room generated. id = ${roomId}, join code = ${joinCode}`);
      } catch {
        socket.emit("error", "Could not create room.");
      }
    });

    socket.on("start-game", async (msg) => {
      log_event(`Requested to start game: ${msg}`);
      const roomId = gameServer.hostIdToRoomIdLookup.get(socket.id)!;
      const room = gameServer.rooms.get(roomId)!;
      //replace this with the actual place to get data from 
      const matchState = room.gameState;
      //emit to each of the two players in that room --> unsure
      room.players.forEach(player => {
      const personal = matchState.players[player.displayName];
      playerChannel.to(player.socketId).emit("match-start", {
        you:    personal,
        global: { /*Data variables to be passed here*/ }
    });
  });
      // Notify everyone in this room
      gameServer.rooms
        .get(gameServer.hostIdToRoomIdLookup.get(socket.id)!)!
        .players.forEach((player) => {
          playerChannel.to(player.socketId).emit("game-started"); // TODO modify as needed
        });
      log_notice("All players informed of start.");
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
    checkResult.isDisplayNameValid = !gameServer.rooms
      .get(roomId)
      ?.hasPlayer(req.body.displayName);

    log_notice(`Player auth check result:\n${JSON.stringify(checkResult)}`);
    res.send(checkResult);
  });
  playerChannel.use((socket, next) => {
    log_event(
      `Player attempted to join with ${JSON.stringify(socket.handshake.auth)}`
    );
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
      gameServer.joinRoom(socket.id, roomId, auth.displayName, undefined);
    } catch (err) {
      if (err instanceof Error) {
        log_warning("Join room failed unexpectedly.\n" + err.message);
        log_attention(gameServer.rooms.get(roomId)?.players)
      } else {
        log_attention("Unexpected error is not of error type.");
      }
      next(new Error("Invalid credentials"));
    }

    log_event(
      `Join code <${auth.joinCode}> is valid. From <${auth.displayName}>. Socket id = ${socket.id}`
    );
    const playerNameList = [
      ...gameServer.rooms.get(roomId)?.players.values()!,
    ].map((player) => player.displayName);
    console.log("Update player list", playerNameList, "to", gameServer.rooms.get(roomId)!.hostSocketId)
    hostChannel
      .to(gameServer.rooms.get(roomId)!.hostSocketId)
      .emit("player-set-changed", playerNameList);
    next();
  });

  playerChannel.on("connection", async (socket: Socket) => {
    log_event(`Player connected: ${socket.id}`);

    socket.on("disconnect", () => {
      log_event("Player disconnected.");
    });

    socket.on("submit-move", async (msg) => {
      console.log("Move submitted: ", JSON.stringify(msg));

      // TODO turn stuff

      // TODO if all users submitted and a turn can be processed
      if (false) {
        const TEMP_playerSocketId = "sdfgrdfgrdgfrdfg";
        playerChannel
          .to(TEMP_playerSocketId)
          .emit("turn-result", "PLACEHOLDER RESULT");
      }
    });
  });

  httpServer.listen(config.serverPort, () => {
    log_notice(
      `Socket.IO server running on ${
        config.serverIp.toString() + ":" + config.serverPort.toString()
      }. <CTRL+C> to shutdown.`
    );
    //#endregion

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
