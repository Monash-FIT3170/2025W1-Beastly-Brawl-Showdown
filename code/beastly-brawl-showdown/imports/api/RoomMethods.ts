import { io } from "socket.io-client";
import { Meteor } from "meteor/meteor";
import {locateServerBest } from "../../server/GameServerLocator";

Meteor.methods({
  // /** Request for a room to be allocated */
  // async requestHostRoom() {
  //   console.log("Requesting to host room.");
  //   return await requestRoomCreation();
  // },

  async getBestServerUrl(): Promise<string> {
    /// Lookup the server info from the global db
    const serverUrl = await locateServerBest();
    /// Attempt to connect to the specified server
    console.log(`Testing connection to game server @ <${serverUrl}>.`);

    /// Check with server if join code leads to an active room if not error
    return new Promise((resolve, reject) => {
      const socket = io(serverUrl);
      /// If said server is not responding then error
      const echoMsg = "Test echo msg";
      socket.on("connect", () => {
        console.log("Connected to server");

        // Send a test message
        console.log("Test connection to server (echo)");
        socket.emit("echo", echoMsg);
      });
      socket.on("echo", async (msg: any) => {
        console.log("Echo sent:", echoMsg, " | Echo response:", msg);
        resolve(serverUrl);
      });

      socket.on("connect_error", (err: { message: any; }) => {
        console.error(`Connection failed: ${err.message}`);
        reject(new Error("Room is not joinable."));
      });
    });
  },

  // /**
  //  * Get the url of the server which generated this code only if it is active.
  //  * @param joinCode
  //  * @returns the url of the server that this code is from
  //  */
  // async getServerConnection(joinCode: string): Promise<string> {
  //   console.log(`Requesting to join room with code <${joinCode}>.`);
  //   // TODO make sure that the rooms can mark themselves as closed / in progress

  //   /// Lookup the server info from the global db
  //   const serverUrl = await locateServer(joinCode);
  //   /// Attempt to connect to the specified server
  //   console.log(`Attempting to connect to game server @ <${serverUrl}>.`);
  //   const gameServerConnection = DDP.connect(serverUrl);
  //   /// If said server is not responding then error

  //   /// Check with server if join code leads to an active room if not error
  //   return new Promise((resolve, reject) => {
  //     gameServerConnection.call(
  //       "checkHasJoinableRoom",
  //       joinCode,
  //       (error: Error, result: boolean) => {
  //         if (error) {
  //           console.error("RPC Error:", error);
  //           reject(error);
  //         } else {
  //           console.log("Is room joinable:", result);
  //           if (!result) {
  //             reject(new Error("Room is not joinable."));
  //           }

  //           resolve(serverUrl);
  //         }
  //       }
  //     );
  //   });
  // },
});