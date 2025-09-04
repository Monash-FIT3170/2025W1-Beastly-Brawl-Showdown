import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { COMMON_MONSTER_POOL } from "../../../simulator/data/common/common_monster_pool";
import { MonsterTemplate } from "../../../simulator/core/monster/monster";
import { BattleScreen } from "../../BattleScreen/BattleScreen";
import WinnerScreen from "../../host/projector/WinnerScreen";

//#region Socket Context Definition
interface PlayerSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const PlayerSocketContext = createContext<PlayerSocketContextType>({
  socket: null,
  isConnected: false,
});

const PlayerSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  useEffect(() => {
    if (!socketRef.current && serverUrl) {
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
    <PlayerSocketContext.Provider
      value={{ socket: socketRef.current, isConnected }}
    >
      {children}
    </PlayerSocketContext.Provider>
  );
};

export const usePlayerSocket = () => useContext(PlayerSocketContext);
//#endregion

//#region Main Player Component
const PlayerContent = () => {
  const { socket, isConnected } = usePlayerSocket();

  const [matchData, setMatchData] = useState<{
    myMonster: { template: MonsterTemplate; currentHp: number };
    enemyMonster: { template: MonsterTemplate; currentHp: number };
  } | null>(null);
  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [winner, setWinner] = useState();
  const [waiting, setWaiting] = useState(false);

  const waitingTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("game-started", () => setStartSelection(true));

    socket.on("round-start", (data) => {
      log_event("Received round-start data:", data);

      const myTemplateName = data?.myMonster;
      const enemyTemplateName = data?.enemyMonster;

      if (!myTemplateName || !enemyTemplateName) {
        console.warn("Incomplete round-start data:", data);
        return;
      }

      console.log(
        `Round started! Player's monster: ${myTemplateName}, Opponent's monster: ${enemyTemplateName}`
      );

      // Create Monster instances for BattleScreen
      const myMonster =
        COMMON_MONSTER_POOL.monsters[
        myTemplateName as keyof typeof COMMON_MONSTER_POOL.monsters
        ];
      const enemyMonster =
        COMMON_MONSTER_POOL.monsters[
        enemyTemplateName as keyof typeof COMMON_MONSTER_POOL.monsters
        ];

      setMatchData({
        myMonster: { template: myMonster, currentHp: data.myHp },
        enemyMonster: { template: enemyMonster, currentHp: data.enemyHp },
      });
      setAllReady(true);
    });

    socket.on("sendToWaiting", (msg) => {
      console.log(`${msg} me!`);
      setWaiting(true);
      console.log("Now waiting for other matches to finish");
    });

    socket.on("tournament-finished", (data) => {
      setWinner(data);
    });

    return () => {
      socket.off("game-started");
      socket.off("round-start");
      socket.off("sendToWaiting");
      socket.off("tournament-finished");
    };
  }, [socket]);

  useEffect(() => {
    if (!isConnected) return;

    const restartAnimation = () => {
      if (waitingTextRef.current) {
        const letters =
          waitingTextRef.current.querySelectorAll(".bounce-letter");
        letters.forEach((letter, index) => {
          const element = letter as HTMLElement;
          element.style.animation = "none";
          requestAnimationFrame(() => {
            element.style.animation = `bounce 0.6s ease-in-out ${index * 0.1
              }s both`;
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

  const handleMonsterSelection = (monsterName: string) => {
    // Find the monster in COMMON_MONSTER_POOL by name
    const monster = Object.values(COMMON_MONSTER_POOL.monsters).find(
      (m) => m.name === monsterName
    );

    if (!monster) {
      console.error("Invalid monster selected:", monsterName);
      return;
    }

    if (socket) {
      // Send the templateId instead of the name
      socket.emit("RequestSubmitMonster", { data: monster.templateId });
      setMonsterSelected(true);
      console.log("Monster selected:", monster.templateId);
    } else {
      console.warn("No socket connection available");
    }
  };

  if (!isConnected) return <p>Connecting to server...</p>;

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

  if (!startSelection) return <WaitingScreen />;
  if (!monsterSelected)
    return (
      <MonsterSelectionScreen
        setSelectedMonsterCallback={handleMonsterSelection}
      />
    );
  if (!allReady || waiting) return <WaitingScreen />; // TODO: add additional check for new match_complete state
  if (winner) return <WinnerScreen winnerName={winner} />;

  return <BattleScreen matchData={matchData!} />;
};
//#endregion

//#region Exported Component
export const Player = () => (
  <PlayerSocketProvider>
    <PlayerContent />
  </PlayerSocketProvider>
);

function log_event(message: string, data?: any) {
  console.log(message, data);
}
//#endregion
