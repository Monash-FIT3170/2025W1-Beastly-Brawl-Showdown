import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import { io, Socket } from "socket.io-client";
import React, { useState, useRef, useEffect } from "react";

export default function ProjectorPage() {
  const [serverUrl, setServerUrl] = useState<string>();
  const [roomId, setRoomId] = useState<number>();
  const [joinCode, setJoinCode] = useState<string>("");

  const [playerList, setPlayerList] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  function getJoinUrl() {
    return Meteor.absoluteUrl() + "join/" + joinCode;
  }

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

    //#region Startup
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
    socketRef.current.on(
      "request-room_response",
      (roomInfo: { roomId: number; joinCode: string }) => {
        console.log("Room request response", roomInfo);
        setRoomId(roomInfo.roomId);
        setJoinCode(roomInfo.joinCode);
      }
    );

    //#region Host App events
    socketRef.current.on("player-set-changed", (newPlayerList: string[]) => {
      console.log("New set of players:", newPlayerList.toString());
      setPlayerList(newPlayerList);
    });


    if (!roomId) {
      socketRef.current.emit("request-room");
      return;
    }
    //#endregion

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, [serverUrl]);
  //#endregion

  //#region Host App

  function handleStartGame() {
    if (socketRef.current) {
      socketRef.current.emit("start-game", { roomId }); // Send start-game to server
      console.log("Start game requested!");
    }
  }

  if (!serverUrl || !roomId) return <p>Connecting / Starting room...</p>;

  return (
    <div className="canvas-body" id="waiting-room-body">
      <div className="waiting-room-header">
        <div className="join-info">
          Join the game with your phone!
          <br />
          Scan the QR code or join with the code!
        </div>
        <WaitingRoomInfoBox joinCode={joinCode} joinUrl={getJoinUrl()} />
      </div>

      <div className="waiting-room-logo">
        <h1>Beastly Brawl Showdown!</h1>
      </div>

      <ParticipantDisplayBox name={playerList.toString()} />

      <button className="glb-btn" id="start-game-btn" onClick={handleStartGame}>
        Start Game
      </button>
    </div>
  );
  //#endregion
}