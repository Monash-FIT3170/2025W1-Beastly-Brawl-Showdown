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
  serverNumber: number;
  maxCapcity: number;
  overrideExistingRecordOnStartup: boolean;
};

async function main(config: ServerConfig) {
  //#region Startup
  log_notice("Starting server...");

  log_notice("Start websocket server...");
  const app = express();
  app.use(cors()); // Allow cross-origin requests

  const httpServer = http.createServer(app);
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
  GameServerRegisterModel.findOneAndUpdate<IGameServerRegisterEntry>(
    { serverNumber: config.serverNumber },
    {
      serverNumber: config.serverNumber,
      serverUrl: "localhost:4000",
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
  log_notice("Registered to records.");

  log_notice("Starting game service...");
  const gameServer = new GameServer(config.serverNumber, config.maxCapcity);

  log_notice("Server set up complete.");
  //#endregion

  //#region Events
  log_notice("Register events and start listening...");
  // socketServer.use((socket, next) => {
  //   const { joinCode } = socket.handshake.auth;
  //   log_event(
  //     `User attempted to join with ${JSON.stringify(socket.handshake.auth)}`
  //   );
  //   if (isValidCode(joinCode)) {
  //     log_event(`Code <${socket.handshake.auth}> is valid.`);
  //     next();
  //   } else {
  //     log_event("Authentication failed");
  //     next(new Error("Invalid credentials"));
  //   }
  // });

  // log_notice("Attatching events...");
  // socketServer.on("connection", async (socket: Socket) => {
  //   log_event(`User connected: ${socket.handshake.auth.joinCode}`);
  log_notice("Attatching events...");
  socketServer.on("connection", async (socket: Socket) => {
    log_event(`User attempted connection with id: ${socket.id}`);

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

    socket.on("request-room", () => {
      log_event("Room requested.");
      try {
        const { roomId: RoomId, joinCode: JoinCode } = gameServer.createRoom();

        socket.emit("request-room_response", {
          roomId: RoomId,
          joinCode: JoinCode,
        });
      } catch {
        socket.emit("error", "Could not create room.");
      }
    });
  });

  hostChannel.use((socket, next) => {
    log_event(
      `Host attempted to join with ${JSON.stringify(socket.handshake.auth)}`
    );
    const roomId = socket.handshake.auth.roomId;
    if (gameServer.hasRoom(roomId)) {
      log_event(`Room id <${roomId}> is valid.`);
      next();
    } else {
      log_event("Authentication failed");
      next(new Error("Invalid credentials"));
    }
  });

  hostChannel.on("connection", async (socket: Socket) => {
    log_event(`Host connected: ${socket.id}`);

    socket.on("disconnect", () => {
      log_event("Host disconnected.");
    });

    socket.on("start-game", async (msg) => {
      log_event(`Requested to start game: ${msg}`);
      // TODO do something
      // socket.emit("serverResponse", `Recieved: ${msg}`);
    });
  });

  playerChannel.use((socket, next) => {
    log_event(
      `Player attempted to join with ${JSON.stringify(socket.handshake.auth)}`
    );
    const { joinCode: joinCode, displayName: displayName } =
      socket.handshake.auth;

    if (!gameServer.hasRoom(gameServer.translateJoinCodeToRoomId(joinCode))) {
      log_event("Joined with invalid join code");
      next(new Error("Invalid credentials"));
      return;
    }

    try {
      gameServer.joinRoom(
        gameServer.translateJoinCodeToRoomId(joinCode),
        displayName,
        undefined
      );
    } catch {
      next(new Error("Invalid credentials"));
    }

    log_event(
      `Join code <${socket.handshake.auth}> is valid. From <${displayName}>. <${socket.id}>`
    );
    next();
  });

  playerChannel.on("connection", async (socket: Socket) => {
    log_event(`Player connected: ${socket.id}`);
    // TODO add player info to room
    // notify player

    socket.on("disconnect", () => {
      log_event("Player disconnected.");
    });

    socket.on("submit-move", async (msg) => {
      console.log("move submitted: ", JSON.stringify(msg));
    });
  });

  httpServer.listen(8080, () => {
    log_notice(
      "Socket.IO server running on http://localhost:8080."
      // "Socket.IO server running on http://localhost:8080. Type 'shutdown' to close."
    );
    //#endregion

    // // //#region IO
    // // // read io for graceful shutdown
    // // // Readline setup
    // // const rl = readline.createInterface({
    // //   input: process.stdin,
    // //   output: process.stdout,
    // // });

    // // // Listen for "shutdown" command
    // // const listenForShutdown = () => {
    // //   rl.question("> ", (answer) => {
    // //     /// TODO use tokens
    // //     if (answer.trim().toLowerCase() === "shutdown") {
    // //       log_warning("Gracefully shutting down...");
    // //       rl.close(); // Close input interface
    // //       io.close(); // Close Socket.IO
    // //       server.close(() => {
    // //         log_attention("Server closed.");
    // //         process.exit(0); // Exit process
    // //       });
    // //       return;
    // //     }
    // //     listenForShutdown(); // Continue listening for input
    // //   });
    // // };
    // // //#endregion

    // // Start listening
    // listenForShutdown();
  });
}

log_notice("Loading config...");
log_attention("Config not implemented yet. Using placeholder.");
const config = {
  serverNumber: 7,
  maxCapcity: 12,
  overrideExistingRecordOnStartup: true,
};
log_notice("Config loaded.");

main(config);
