import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import { io, Socket } from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";

export default function ProjectorPage() {
  const [serverUrl, setServerUrl] = useState<string>();
  const [roomId, setRoomId] = useState<number>();
  const [joinCode, setJoinCode] = useState<string>();

  const [playerList, setPlayerList] = useState<string[]>([]);

  function getJoinUrl() {
    return Meteor.absoluteUrl() + "join/" + joinCode;
  }

  //#region Connect to game server
  const socketRef = useRef<Socket>();
  useEffect(() => {
    if (socketRef.current) {
      return; /// Already has a socket
    }

    if (!serverUrl) {
      /// Try get best server url
      Meteor.call("getBestServerUrl", (error: any, result: string) => {
        if (error) {
          console.error("Error locating room:", error);
          return;
        }
  
        console.log("Server found at:", result);
        setServerUrl(result);
      });
    }

    if (!serverUrl) {
      console.log("Waiting for server url to load.");
      return;
    }

    // Connect to game server
    socketRef.current = io(serverUrl + "/host");
    socketRef.current.on("connect", () => {
      if (!socketRef.current) {
        console.error("No socket open.");
        return;
      }
      console.log("Connected to server");

      // Send a test message
      socketRef.current.emit("message", "Hello from Projector!");
    });

    socketRef.current.on("connect_error", (err: Error) => {
      console.error(`Connection failed: ${err.message}`);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socketRef.current.on("echo", (msg: string) => {
      console.log(`Server says: ${msg}`);
    });
    //#endregion

    //#region Request Room
    socketRef.current.on("request-room_response", (roomInfo: { roomId: number; joinCode: string }) => {
      console.log("Room request response", roomInfo);
      setRoomId(roomInfo.roomId);
      setJoinCode(roomInfo.joinCode);
    });

    socketRef.current.on("player-set-changed", (newPlayerList: string[]) => {
      console.log("New set of players:", newPlayerList.toString());
      setPlayerList(newPlayerList);
    });

    console.log("Request new room.");
    socketRef.current.emit("RequestNewRoom");
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, [serverUrl]);
  //#endregion

  //#region Startup
  if (!serverUrl) {
    return (
      <>
        <p>Connecting to servers...</p>
      </>
    );
  }

  if (!roomId) {
    return (
      <>
        <p>Starting room...</p>
      </>
    );
  }
  //#endregion

  //#region Host App

  /**
   * Handle button click to start the game
   * Sends arguments to main.ts listener
   */
  function startGame() {
    socketRef.current.emit("RequestStartGame");
  }

  return (
    <div className="waiting-room-box">
      <h1>Game Lobby</h1>
      <h2>Room ID: {joinCode}</h2>
      <WaitingRoomInfoBox joinUrl={getJoinUrl()} />
      <ParticipantDisplayBox name={playerList.toString()} />
      <button className="btn" onClick={startGame}>
        Start Game
      </button>
    </div>
  );
  //#endregion
}
