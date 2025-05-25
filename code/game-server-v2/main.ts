import { GameServer } from "./GameServer";
import * as readline from "readline";
import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import connectDb from "./db/db";
import {
  GameServerRegisterModel,
  IGameServerRegisterEntry,
} from "./db/models";
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

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  const projectorChannel = io.of("/projector");
  const playerChannel = io.of("/player");

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
    { serverNumber: 1 },
    {
      serverNumber: 1,
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
  const authenticate = (userId: string, joinCode: string): boolean => {
    // TODO check if this is a vaid join code from an active room
    return "123456" == joinCode;
  };

  io.use((socket, next) => {
    const { userId, joinCode } = socket.handshake.auth;
    if (authenticate(userId, joinCode)) {
      log_event(`User authenticated: ${userId}`);
      next();
    } else {
      log_event("Authentication failed");
      next(new Error("Invalid credentials"));
    }
  });

  log_notice("Attatching events...");
  playerChannel.on("connection", async (socket: Socket) => {
    log_event(`User connected: ${socket.handshake.auth.userId}`);

    //#region Standard
    socket.on("disconnect", () => {
      log_event("User disconnected.");
    });

    socket.on("ping", () => {
      log_event(`pong`);
      socket.emit("pong");
    });
    //#endregion

    socket.on("message", async (msg) => {
      log_event(`Received: ${msg}`);
      socket.emit("serverResponse", `Recieved: ${msg}`);
    });
  });

  server.listen(8080, () => {
    log_notice(
      "Socket.IO server running on http://localhost:8080. Type 'shutdown' to close."
    );
    //#endregion

    //#region IO
    // read io for graceful shutdown
    // Readline setup
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Listen for "shutdown" command
    const listenForShutdown = () => {
      rl.question("> ", (answer) => {
        /// TODO use tokens
        if (answer.trim().toLowerCase() === "shutdown") {
          log_warning("Gracefully shutting down...");
          rl.close(); // Close input interface
          io.close(); // Close Socket.IO
          server.close(() => {
            log_attention("Server closed.");
            process.exit(0); // Exit process
          });
          return;
        }
        listenForShutdown(); // Continue listening for input
      });
    };
    //#endregion

    // Start listening
    listenForShutdown();
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
