import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { COMMON_MONSTER_POOL } from "../../../../../simulator/data/common/common_monster_pool";
import type { MonsterTemplate } from "../../../../../simulator/core/monster/monster_template";
import { BattleScreen } from "../../BattleScreen/BattleScreen";
import WinnerScreen from "../../host/projector/WinnerScreen";
import type { ChooseMove, Notice, Roll } from "../../../../../simulator/core/notice/notice";
import type { EntryID } from "../../../../../simulator/core/utils";
import type { TargetingMethod } from "../../../../../simulator/core/action/targeting";

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
    if ((!socketRef.current || !socketRef.current.connected) && serverUrl) {
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

  return <PlayerSocketContext.Provider value={{ socket: socketRef.current, isConnected }}>{children}</PlayerSocketContext.Provider>;
};

export const usePlayerSocket = () => useContext(PlayerSocketContext);
//#endregion

//#region Main Player Component
const PlayerContent = () => {
  const { socket, isConnected } = usePlayerSocket();

  const [matchData, setMatchData] = useState<{ player1Monster: { template: MonsterTemplate; currentHp: number }; player2Monster: { template: MonsterTemplate; currentHp: number }; myid: number } | null>(null);
  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [winner, setWinner] = useState();
  const [waiting, setWaiting] = useState(false);
  const [noSelections, setNoSelections] = useState(0);
  const [randomMonsterPool, setMonsterPool] = useState<string[]>();

  const [events, setEvents] = useState<any[]>([]);
  const [chooseMove, setChooseMove] = useState<ChooseMove | null>(null);
  const [hasReceivedChooseMove, setHasReceivedChooseMove] = useState(false);
  const [rollNotice, setRollNotice] = useState<Roll | null>(null);
  const [showRollMessage, setShowRollMessage] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState<number>(20);
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [showEnemySubmittedMessage, setshowEnemySubmittedMessage] = useState(false);
  const [showSubmittedMoveMessage, setshowSubmittedMoveMessage] = useState(false);
  const [turnFinishedPlaying, setTurnFinishedPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [buttonDisabled, setbuttonDisabled] = useState(false);

  const waitingTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("return-from-waiting", () => {console.log("Returned from waiting")})

    //#region Monster selection handle
    socket.on("select-monster", (data) => {
      if (data?.monsterPool) {
        setMonsterPool(data.monsterPool); // store in state to pass to MonsterSelectionScreen
      }
      setStartSelection(true);
      setMonsterSelected(false);
      setAllReady(false);
      setNoSelections((prevSelections) => {
        const newVal = prevSelections + 1;
        return newVal;
      });
    });
    //#endregion

    //#region Round Start
    socket.on("round-start", (data) => {
      setWaiting(false);
      log_event("Received round-start data:", data);

      const player1TemplateName = data?.player1Monster;
      const player2TemplateName = data?.player2Monster;

      if (!player1TemplateName || !player2TemplateName) {
        console.warn("Incomplete round-start data:", data);
        return;
      }

      console.log(
        `Round started! Player 1's monster: ${player1TemplateName}, Player 2's monster: ${player2TemplateName}, I am ${data.sideID}`
      );

      // Create Monster instances for BattleScreen
      const player1Monster = COMMON_MONSTER_POOL.monsters[player1TemplateName as keyof typeof COMMON_MONSTER_POOL.monsters];
      const player2Monster = COMMON_MONSTER_POOL.monsters[player2TemplateName as keyof typeof COMMON_MONSTER_POOL.monsters];

      if (typeof data?.sideID !== "number") {
        console.warn("Missing or invalid sideID in round-start data:", data);
        return;
      }
      setMatchData({
        player1Monster: { template: player1Monster, currentHp: player1Monster.baseStats.health },
        player2Monster: { template: player2Monster, currentHp: player2Monster.baseStats.health },
        myid: data.sideID,
      });

      setAllReady(true);
    });

    //#region Waiting Room
    socket.on("send-to-waiting", () => {
      setWaiting(true);
    });
    //#endregion

    // socket.on("return-from-waiting", () => {
    //   setWaiting(false);
    // });

    //#region Set winner
    socket.on("tournament-finished", (data) => {
      setWaiting(false);
      setWinner(data);
    });
    //#endregion

    return () => {
      socket.off("select-monster");
      socket.off("round-start");
      socket.off("send-to-waiting");
      // socket.off("return-from-waiting");
      socket.off("tournament-finished");
    };
  }, [socket]);

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

    const handleMonsterSelection = (monsterName: string) => {
    // Find the monster in COMMON_MONSTER_POOL by name
    const monster = Object.values(COMMON_MONSTER_POOL.monsters).find((m) => m.name === monsterName);

    if (!monster) {
      console.error("Invalid monster selected:", monsterName);
      return;
    }

    if (socket) {
      // Send the templateId instead of the name
      console.log("No of selections: ", noSelections);
      socket.emit("RequestSubmitMonster", {
        data: {
          monsterTemplate: monster.templateId,
          selections: noSelections,
        },
      });
      setMonsterSelected(true);
      console.log("Monster selected:", monster.templateId);
    } else {
      console.warn("No socket connection available");
    }
  };

  //#region battleScreen props

  // Listen for 'match-started' socket event
  useEffect(() => {
    if (!socket) return undefined;
    const handleMatchStarted = (data: any) => {
      console.log("Match started:", data);
    };
    socket.on("match-started", handleMatchStarted);
    return () => {
      socket.off("match-started", handleMatchStarted);
    };
  }, [socket]);

  //notice handler
  useEffect(() => {
    if (!socket) return;
    const handleNewNotice = (notice: Notice) => {
      console.log("Receiving Notice of type " + notice.kind)
      switch (notice.kind){
        case "roll": {
          setshowEnemySubmittedMessage(false);
          setshowSubmittedMoveMessage(false);
          setRollNotice(notice);
          setShowRollMessage(true)
          break;
        }
        case "chooseMove": {
          setHasReceivedChooseMove(true);
          setChooseMove(notice);
          break;
        }
        case "rerollOption": {
          notice.callback(true);
          break;
        }
        default: {
          console.warn("ERROR, UNHANDLED NOTICE TYPE");
          break;
        }
      }
    };
    socket.on("newNotice", handleNewNotice);
    return () => {
      socket.off("newNotice", handleNewNotice);
    };
  }, [socket]);

  //event handler
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (ev: any) => {
      // Check if this is a roll event for the current player
      if (ev.name === "roll" && ev.source === matchData?.myid) {
        // Show dice animation with the actual server roll result
        setDiceRollResult(ev.result);
        setShowDiceAnimation(true);
      }
      
      setEvents(prev => {
        const next = [...prev, ev];
        return next;
      });
    };

    socket.on("newEvent", handleNewEvent);
    return () => {
      socket.off("newEvent", handleNewEvent);
    };
  }, [socket, matchData?.myid]);

  //listen for enemy submitting messages
  useEffect(() => {
    if (!socket) return;

    const handleEnemySubmitted = () => {
      setshowEnemySubmittedMessage(true);
    };

    socket.on("EnemySubmitted", handleEnemySubmitted);
    return () => {
      socket.off("EnemySubmitted", handleEnemySubmitted);
    };
  }, [socket]);

  //UnlockButton responder, so we know when server is ready to unlock the button
  useEffect(() => {
    if (!socket) return;

    const handleUnlock = () => {
      setTurnFinishedPlaying(false);
      setShowMessage(false);
      setshowSubmittedMoveMessage(false);
      setshowEnemySubmittedMessage(false);
    };

    socket.on("UnlockButton", handleUnlock);
    return () => {
      socket.off("UnlockButton", handleUnlock);
    };
  }, [socket]);

  //button unlocker for when both client and server are ready
  useEffect(() => {
    if (hasReceivedChooseMove && turnFinishedPlaying) {
      setbuttonDisabled(false);
    }
  }, [hasReceivedChooseMove, turnFinishedPlaying]);

  //function that executes roll on server
  function rollNow(rollNotice: Roll): void {
    if (!socket) return;
    // Execute the roll on server immediately
    setShowMessage(false);
    const params: Parameters<typeof rollNotice.callback> = [];
    socket.emit("requestRoll", rollNotice.kind, params);
    setRollNotice(null);
    setShowRollMessage(false);
    // Note: dice animation will be triggered when we receive the roll event back from server
  }
  
  //callback function to be passed into battleScrren and battlebottom to handle player actions
  const handleSubmitMove = (moveId: EntryID, targetMethod: TargetingMethod, myMonsterId: EntryID) => {
    if (!socket) return;
    socket.emit("RequestSubmitMove", {
      data: { moveId, targetMethod, myMonsterId },
    });
  };
  
  //#endregion

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
  if (!monsterSelected) return <MonsterSelectionScreen monsterPool={randomMonsterPool} setSelectedMonsterCallback={handleMonsterSelection} />;
  if (!allReady || waiting) return <WaitingScreen />;
  // TODO: Create a spectator page for losers/byematch to wait in
  if (winner) return <WinnerScreen winnerName={winner} />;

  return <BattleScreen 
    matchData={matchData!} 
    events={events}
    setEvents={setEvents}
    chooseMove={chooseMove}
    setChooseMove={setChooseMove}
    hasReceivedChooseMove={hasReceivedChooseMove}
    rollNotice={rollNotice}
    showRollMessage={showRollMessage}
    buttonDisabled={buttonDisabled}
    setbuttonDisabled={setbuttonDisabled}
    showDiceAnimation={showDiceAnimation}
    diceRollResult={diceRollResult}
    setShowDiceAnimation={setShowDiceAnimation}
    onSubmitMove={handleSubmitMove}
    onRoll={rollNow}
    turnFinishedPlaying={turnFinishedPlaying}
    setTurnFinishedPlaying={setTurnFinishedPlaying}
    showEnemySubmittedMessage={showEnemySubmittedMessage}
    showSubmittedMoveMessage={showSubmittedMoveMessage}
    setShowSubmittedMoveMessage={setshowSubmittedMoveMessage}
    showMessage={showMessage}
    setShowMessage={setShowMessage}
  />;
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
