import React, { createContext, useContext, useEffect, useRef, useState, } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { BattleScreen } from "../../BattleScreen/BattleScreen";

//#region Socket Context Definition
interface PlayerSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const PlayerSocketContext = createContext<PlayerSocketContextType>({
  socket: null,
  isConnected: false,
});

const PlayerSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(serverUrl + "/player", {
        auth: { joinCode, displayName },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection failed:", err.message);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [serverUrl, joinCode, displayName]);

  return (
    <PlayerSocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </PlayerSocketContext.Provider>
  );
};

export const usePlayerSocket = () => useContext(PlayerSocketContext);
//#endregion

//#region Main Player Component
const PlayerContent = () => {
  const { socket, isConnected } = usePlayerSocket();
  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("game-started", () => {
      setStartSelection(true);
    });

    return () => {
      socket.off("game-started");
    };
  }, [socket]);

  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

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

  const handleMonsterSelection = (monster: string) => {
    if (socket){
      socket.emit("monster-selected", {Monster : monster})
    }
    setMonsterSelected(true);
    console.log("Monster selected:", monster);
  }

  // const handleMonsterSelection = (monster: string) => {
  //   socket?.emit("selected-monster", {
  //     joinCode,
  //     displayName,
  //     monster,
  //   });
  //   setMonsterSelected(true);
  //   console.log("Monster selected:", monster);
  // };

  if (!monsterSelected) {
    return (
      <MonsterSelectionScreen setSelectedMonsterCallback={handleMonsterSelection} />
    );
  }

  return <BattleScreen selectedMonsterName={"MysticWyvern"} />;
};
//#endregion

//#region Exported Component
export const Player = () => (
  <PlayerSocketProvider>
    <PlayerContent />
  </PlayerSocketProvider>
);
//#endregion

