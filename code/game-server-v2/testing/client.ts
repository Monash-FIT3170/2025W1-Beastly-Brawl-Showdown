import { io } from "socket.io-client";

const socket = io("http://localhost:8080/");

socket.on("echo", (msg) => {
  console.log(`Server says: ${msg}`);
});

socket.on("connect", () => {
  console.log("Connected to server");

  // Send a test message
  socket.emit("message", "Hello from client!");
});

socket.on("connect_error", (err) => {
  console.error(`Connection failed: ${err.message}`);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("request-room_response", (msg) => {
  console.log("Room request response", msg);
});

import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and wait for an answer
const requestInput = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  const _roomId = 1;
  const _joinCode = "860932";
  const _displayName = "Bobby";
  const _hostName = "Mr Host";

  await requestInput("start host join?");
  const hostChannel = io("http://localhost:8080/host", {
    auth: { hostName: _hostName },
  });
  hostChannel.emit("request-room");

  await requestInput("start player join?");
  const playerChannel = io("http://localhost:8080/player", {
    auth: { joinCode: _joinCode, displayName: _displayName },
  });
  playerChannel.on("game-started", () => {
    console.log("GAME START");
  });

  await requestInput("start game?");
  hostChannel.emit("start-game", _roomId);

  // while (1) {
  //   const msg = await requestInput("Echo to server: ");
  //   socket.emit("echo", msg);
  // }

  rl.close();
};

main();
