import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";

export const Player = () => {
  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

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

    // Listens for game-started trigger from
    socketRef.current.on("game-started", () => {
      setStartSelection(true);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, []);
  //#endregion

  // Determines if page should be rendered or not
  const [isConnected, setIsConnected] = useState(false);

  // Determines if monster selection should be started or not
  const [startSelection, setStartSelection] = useState(false);

  // Has a monster been selected or not
  const [monsterSelected, setMonsterSelected] = useState(false);

  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

  // Waiting room page HTML
  if (!startSelection) {
    return (
      <div>
        <h1>PLAYER VIEW</h1>
        <p>Server URL: {serverUrl}</p>
        <p>Name: {displayName}</p>
        <p>Room Code: {joinCode}</p>
      </div>
    );
  }

  //Broadcast Player is done with the monster Selection when tbey have selected a monster
  const handleMonsterSelection = (monster: string) => {
    socketRef.current?.emit('selected-monster', {
      joinCode,
      displayName,
      monster,
    })
    setMonsterSelected(true);
    console.log("Monster selected :D");
  };

  // If no monster has been selected yet, start selection
  if (!monsterSelected) {
    return (
      <MonsterSelectionScreen
        setSelectedMonsterCallback={handleMonsterSelection}
      />
    );
  }

  // return <BattleScreen />;
};
