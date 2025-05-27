import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";


export const Player = () => {
  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");
  const navigate = useNavigate();

  //#region Connect to game server
  const socketRef = useRef<Socket>();
  useEffect(() => {
    socketRef.current = io(serverUrl + "/player", {
      auth: {
        joinCode: joinCode,
        displayName: displayName,
      },
    });
    console.log("Connecting to server with auth...");

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
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

    socketRef.current.on("game-started", () => {
      console.log(`Navigating to monster selection screen :)`)
      setMonsterSelection(true);
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, []);
  //#endregion

  const [isConnected, setIsConnected] = useState(false);
  const [isSelection, setMonsterSelection] = useState(false);


  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

  if (!isSelection) {
    return (
      <div>
        <h1>PLAYER VIEW</h1>
        <p>Server URL: {serverUrl}</p>
        <p>Name: {displayName}</p>
        <p>Room Code: {joinCode}</p>
      </div>
    );
  }

  return <MonsterSelectionScreen />;
};
