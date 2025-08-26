import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { MonsterPool } from "/imports/simulator/data/monster_pool";
import { Monster } from "/imports/simulator/core/monster/monster";
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
    if (!socketRef.current && serverUrl) {
      socketRef.current = io(serverUrl + "/player", { auth: { joinCode, displayName } });

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

  const [matchData, setMatchData] = useState<any | null>(null);
  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);
  const [allReady, setAllReady] = useState(false);

  // Animation ref
  const waitingTextRef = useRef<HTMLDivElement>(null);

  // Restart bounce animation loop
  useEffect(() => {
    if (!isConnected) return;

    const restartAnimation = () => {
      if (waitingTextRef.current) {
        const letters = waitingTextRef.current.querySelectorAll(".bounce-letter");
        letters.forEach((letter, index) => {
          const element = letter as HTMLElement;
          element.style.animation = "none";
          requestAnimationFrame(() => {
            element.style.animation = `bounce 0.6s ease-in-out ${index * 0.1}s both`;
          });
        });
      }
    };

    const initialTimeout = setTimeout(restartAnimation, 100);
    const interval = setInterval(restartAnimation, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on("game-started", () => setStartSelection(true));

    socket.on("round-start", (data) => {
      if (!data?.myMonster || !data?.enemyMonster) {
        console.warn("Received incomplete round-start data:", data);
        return;
      }
      setMatchData(data);
      setAllReady(true);
    });

    return () => {
      socket.off("game-started");
      socket.off("round-start");
    };
  }, [socket]);

  const handleMonsterSelection = (monsterName: string) => {
    const template = MonsterPool.find((m) => m.name === monsterName);
    if (!template) {
      console.error("Invalid monster selected:", monsterName);
      return;
    }

    const monsterInstance = new Monster(template);

    if (socket) {
      socket.emit("RequestSubmitMonster", { data: monsterInstance });
      setMonsterSelected(true);
      console.log("Monster selected:", monsterName);
    } else {
      console.warn("No socket connection available");
    }
  };

  // GUI flow
  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

  const WaitingScreen = () => (
    <div className="waiting-screen">
      <div className="logo" />
      <div className="waiting-wrapper">
        <div className="waiting-line" />
        <div className="waiting-text" ref={waitingTextRef}>
          <span className="bounce-letter">W</span>
          <span className="bounce-letter">a</span>
          <span className="bounce-letter">i</span>
          <span className="bounce-letter">t</span>
          <span className="bounce-letter">i</span>
          <span className="bounce-letter">n</span>
          <span className="bounce-letter">g</span>
          <span className="bounce-letter">.</span>
          <span className="bounce-letter">.</span>
          <span className="bounce-letter">.</span>
        </div>
        <div className="waiting-line" />
      </div>
    </div>
  );

  if (!startSelection) {
    return <WaitingScreen />;
  }

  if (!monsterSelected) {
    return <MonsterSelectionScreen setSelectedMonsterCallback={handleMonsterSelection} />;
  }

  if (!allReady) {
    return <WaitingScreen />;
  }

  return <BattleScreen />;
};
//#endregion

//#region Exported Component
export const Player = () => (
  <PlayerSocketProvider>
    <PlayerContent />
  </PlayerSocketProvider>
);
//#endregion
