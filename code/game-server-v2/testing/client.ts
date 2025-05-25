import { io } from "socket.io-client";

// User credentials
const userId = "user1";
const joinCode = "123456";

const socket = io("http://localhost:8080", {
  auth: { userId, joinCode: joinCode },
});

socket.on("connect", () => {
  console.log("Connected to server");

  // Send a test message
  socket.emit("message", "Hello from client!");
});

// socket.on("serverResponse", (msg) => {
//   console.log(`Server says: ${msg}`);
// });

socket.on("connect_error", (err) => {
  console.error(`Connection failed: ${err.message}`);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
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
  while (1) {
    const msg = await requestInput("Echo to server: ");
    socket.emit("echo", msg);
  }

  rl.close();
};

main();
