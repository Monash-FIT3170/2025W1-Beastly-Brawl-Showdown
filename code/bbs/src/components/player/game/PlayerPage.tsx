import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { COMMON_MONSTER_POOL } from "../../../../../simulator/data/common/common_monster_pool";
import type { MonsterTemplate } from "../../../../../simulator/core/monster/monster_template";
import { BattleScreen } from "../../BattleScreen/BattleScreen";
import WinnerScreen from "../../host/projector/WinnerScreen";
import type { ChooseMove, Notice, Roll, RerollOption } from "../../../../../simulator/core/notice/notice";
import type { EntryID } from "../../../../../simulator/core/utils";
import type { TargetingMethod } from "../../../../../simulator/core/action/targeting";
import type { PlayerClientToServerEvents, PlayerServerToClientEvents } from "../../../../../shared/types";
import WaitingScreen from "../../transitionScreens/WaitingScreen";

type PlayerSocket = Socket<
  PlayerServerToClientEvents,
  PlayerClientToServerEvents
>;

//#region Socket Context Definition
interface PlayerSocketContextType {
  socket: PlayerSocket | null;
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
  const socketRef = useRef<PlayerSocket | null>(null);

  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  useEffect(() => {
    if ((!socketRef.current || !socketRef.current.connected) && serverUrl) {
      socketRef.current = io(serverUrl + "/player", {
        auth: { joinCode, displayName },
        autoConnect: false,
      });
      socketRef.current.connect();

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

  const [battleInstanceKey, setBattleInstanceKey] = useState(0);
  const [matchData, setMatchData] = useState<{
    player1: { name: string; monster: { template: MonsterTemplate; currentHp: number } };
    player2: { name: string; monster: { template: MonsterTemplate; currentHp: number } };
    myId: number;
  } | null>(null);


  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [winner, setWinner] = useState();
  const [waiting, setWaiting] = useState(false);
  const [noSelections, setNoSelections] = useState(0);
  const [randomMonsterPool, setMonsterPool] = useState<string[]>();
  const [isSpectator, setIsSpectator] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [chooseMove, setChooseMove] = useState<ChooseMove | null>(null);
  const [hasReceivedChooseMove, setHasReceivedChooseMove] = useState(false);
  // const [rollNotice, setRollNotice] = useState<Roll | null>(null);
  // const [showRollMessage, setShowRollMessage] = useState(false);
  const [parentDiceRollResult, setParentDiceRollResult] = useState<number | null>(null);
  const [rerollNotice, setRerollNotice] = useState<RerollOption | null>(null);
  const [rerollMode, setRerollMode] = useState<boolean>(false);
  const [showEnemySubmittedMessage, setshowEnemySubmittedMessage] = useState(false);
  const [showSubmittedMoveMessage, setshowSubmittedMoveMessage] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [turnFinishedPlaying, setTurnFinishedPlaying] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isFinalSnapshot, setIsFinalSnapshot] = useState(false);
  const [turnIndex, setTurnIndex] = useState(0);

  useEffect(() => {
    if (!socket) return;

    //#region Monster selection handle
    socket.on("requestMonsterSelection", (data) => {
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
    socket.on("startRound", (data) => {
      setWaiting(false);

      // Reset client-side event stream for the new match
      setEvents([]);
      setTurnFinishedPlaying(true);

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
      const player1Monster =
        COMMON_MONSTER_POOL.monsters[
        player1TemplateName as keyof typeof COMMON_MONSTER_POOL.monsters
        ];
      const player2Monster =
        COMMON_MONSTER_POOL.monsters[
        player2TemplateName as keyof typeof COMMON_MONSTER_POOL.monsters
        ];

      if (typeof data?.sideID !== "number") {
        console.warn("Missing or invalid sideID in round-start data:", data);
        return;
      }
      setMatchData({
        player1: {
          name: data.player1name,
          monster: {
            template: player1Monster,
            currentHp: player1Monster.baseStats.health,
          },
        },
        player2: {
          name: data.player2name,
          monster: {
            template: player2Monster,
            currentHp: player2Monster.baseStats.health,
          },
        },
        myId: data.sideID,
      });

      // Check if player is spectator
      if (data.spectator) {
        setIsSpectator(true);
      }

      // Give a key for every new battle
      setBattleInstanceKey((k) => k + 1);

      setAllReady(true);
    });

    //#region Player Kicked
    socket.on("playerKicked", () => {

      // Disconnect socket
      socket.disconnect();

      // Clear sessionStorage to prevent auto-join
      sessionStorage.removeItem("joinCode");
      sessionStorage.removeItem("displayName");
      sessionStorage.removeItem("serverUrl");

      // Navigate back to home page
      window.location.href = "/home/";
    });


    //#region Waiting Room
    socket.on("sendToWaiting", () => {
      setWaiting(true);
    });
    //#endregion

    //#region Set winner
    socket.on("tournamentFinished", (data) => {
      setWaiting(false);
      setWinner(data);
    });
    //#endregion

    return () => {
      socket.off("requestMonsterSelection");
      socket.off("startRound");
      socket.off("sendToWaiting");
      socket.off("tournamentFinished");
    };
  }, [socket]);

  //#region Wait for animations
  useEffect(() => {
    // Watch the stream for a snapshot with dead HP
    const last = events[events.length - 1];
    if (last?.name === "snapshot" && Array.isArray(last.sides)) {
      const someoneDead = last.sides.some((s: any) => s?.monster?.health <= 0);
      if (someoneDead) setIsFinalSnapshot(true);
    }
  }, [events]);

  useEffect(() => {
    if (!socket) return;
    if (isFinalSnapshot && turnFinishedPlaying) {
      Promise.resolve().then(() => {
        socket.emit("playerAnimationsDone", { socketId: socket.id });
      })
      // Only ACK once per battle
      setIsFinalSnapshot(false);
    }
  }, [socket, turnFinishedPlaying]);

  const handleMonsterSelection = (monsterName: string) => {
    // Find the monster in COMMON_MONSTER_POOL by name
    const monster = Object.values(COMMON_MONSTER_POOL.monsters).find(
      (m) => m.name === monsterName
    );

    if (!monster) {
      console.error("Invalid monster selected:", monsterName);
      return;
    }

    const displayName = sessionStorage.getItem("displayName");

    if (socket) {
      // Send the templateId instead of the name
      console.log("No of selections: ", noSelections);
      socket.emit("submitMonster", {
        data: {
          monsterTemplate: monster.templateId,
          selections: noSelections,
          displayName: displayName,
        },
      });
      setMonsterSelected(true);
      console.log("Monster selected:", monster.templateId);
    } else {
      console.warn("No socket connection available");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleTurnUpdate = (data: { turnCount: number }) => {
      console.log("Received turn update from server:", data.turnCount);
      setTurnIndex(data.turnCount - 1); // server might send 1-based count
    };

    socket.on("turnUpdated", handleTurnUpdate);

    return () => {
      socket.off("turnUpdated", handleTurnUpdate);
    };
  }, [socket]);

  //#region battleScreen props
  //notice handler

  //#region initializations
  // Initialize monsters when matchData changes
  useEffect(() => {
    if (!matchData) return;

    // Build snapshot JSON
    const snapshot = {
      name: "snapshot", // Ensure 'name' property is present for BaseEvent compatibility
      type: "snapshot",
      sides: [
        {
          id: 0,
          monster: {
            baseID: matchData.player1.monster.template.templateId,
            health:
              matchData.player1.monster.currentHp ??
              matchData.player1.monster.template.baseStats.health,
            attackCharges: matchData.player1.monster.template.maxAttackCharges,
            components: [],
          },
          pendingActions: null,
        },
        {
          id: 1,
          monster: {
            baseID: matchData.player2.monster.template.templateId,
            health:
              matchData.player2.monster.currentHp ??
              matchData.player2.monster.template.baseStats.health,
            attackCharges: matchData.player2.monster.template.maxAttackCharges,
            components: [],
          },
          pendingActions: null,
        },
      ],
      index: 0,
    };

    // put snapshot into events state as the first item
    setEvents([snapshot]);
  }, [matchData]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotice = (notice: Notice) => {
      console.log("Receiving Notice of type " + notice.kind);
      switch (notice.kind) {
        case "roll": {
          setshowEnemySubmittedMessage(false);
          setshowSubmittedMoveMessage(false);
          rollNow(notice)
          // setRollNotice(notice);
          // setShowRollMessage(true);
          break;
        }
        case "chooseMove": {
          setHasReceivedChooseMove(true);
          setIsWaiting(false)
          setChooseMove(notice);
          break;
        }
        case "rerollOption": {
          setRerollNotice(notice)
          setRerollMode(true)
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

  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (ev: any) => {
      setEvents((prev) => {
        const lastEvent = prev[prev.length - 1];

        if (ev.name === "roll" && lastEvent?.name === "startMove") {
          const rollEvent = ev as any;
          if (rollEvent.source === matchData?.myId) {
            setParentDiceRollResult(rollEvent.result);
          }
        }

        const next = [...prev, ev];
        console.log(
          "All events after adding:",
          next.map((e) =>
            e.name === "roll" ? `${e.name} (source: ${e.source})` : e.name
          )
        );
        return next;
      });
    };

    socket.on("newEvent", handleNewEvent);
    return () => {
      socket.off("newEvent", handleNewEvent);
    };
  }, [socket, matchData?.myId]);

  //listen for enemy submitting messages
  useEffect(() => {
    if (!socket) return;

    const handleEnemySubmitted = () => {
      setshowEnemySubmittedMessage(true);
    };

    socket.on(
      "EnemySubmitted" as keyof PlayerServerToClientEvents,
      handleEnemySubmitted
    );
    return () => {
      socket.off(
        "EnemySubmitted" as keyof PlayerServerToClientEvents,
        handleEnemySubmitted
      );
    };
  }, [socket]);

  //UnlockButton responder, so we know when server is ready to unlock the button
  useEffect(() => {
    if (!socket) return;
    console.log("this is reached")

    const handleUnlock = () => {
      setTurnFinishedPlaying(false);
      setShowMessage(false);
      setIsWaiting(false)
      setshowSubmittedMoveMessage(false);
      setshowEnemySubmittedMessage(false);
    };

    socket.on("UnlockButton" as keyof PlayerServerToClientEvents, handleUnlock);
    return () => {
      socket.off(
        "UnlockButton" as keyof PlayerServerToClientEvents,
        handleUnlock
      );
    };
  }, [socket]);

  //button unlocker for when both client and server are ready
  const isButtonEnabled = hasReceivedChooseMove && turnFinishedPlaying;

  //function that executes roll on server
  function rollNow(rollNotice: Roll): void {
    if (!socket) return;
    // Execute the roll on server immediately
    setShowMessage(false);
    const params: Parameters<typeof rollNotice.callback> = [];
    socket.emit("requestRoll", { kind: rollNotice.kind, params });
    // setRollNotice(null);
    // setShowRollMessage(false);
    // Note: dice animation will be triggered when we receive the roll event back from server
  }

  function rerollNow(optionChosen: boolean): void {
    if (!socket) return;
    socket.emit("requestReroll", optionChosen)
    // setParentDiceRollResult(null)
    setRerollNotice(null)
    setRerollMode(false)
  }

  //callback function to be passed into battleScrren and battlebottom to handle player actions
  const handleSubmitMove = (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    myMonsterId: EntryID
  ) => {
    if (!socket) return;
    socket.emit("submitMove", {
      data: { moveId, targetMethod, myMonsterId },
    });
  };

  // Debugging useEffect
  useEffect(() => {
    console.log(
      "Button is now",
      isButtonEnabled ? "ENABLED" : "DISABLED",
      "| hasReceivedChooseMove =",
      hasReceivedChooseMove,
      "| turnFinishedPlaying =",
      turnFinishedPlaying
    );
  }, [isButtonEnabled, hasReceivedChooseMove, turnFinishedPlaying]);

  useEffect(() => {
    console.log("isWaiting changed:", isWaiting);
  }, [isWaiting]);

  //#endregion

  if (!isConnected) return <p>Connecting to server...</p>;

  if (!startSelection) return <WaitingScreen />;
  if (!monsterSelected)
    return (
      <MonsterSelectionScreen
        monsterPool={randomMonsterPool}
        setSelectedMonsterCallback={handleMonsterSelection}
      />
    );
  // if (!allReady || waiting) return <WaitingScreen />;
  if (!allReady || waiting) return <WaitingScreen />;
  if (winner) return <WinnerScreen winnerName={winner} />;

  console.log("Rendering BattleScreen with matchData:", matchData);

  return <BattleScreen
    matchData={matchData!}
    events={events}
    setEvents={setEvents}
    chooseMove={chooseMove}
    setChooseMove={setChooseMove}
    setHasReceivedChooseMove={setHasReceivedChooseMove}
    buttonDisabled={!isButtonEnabled}
    onSubmitMove={handleSubmitMove}
    setTurnFinishedPlaying={setTurnFinishedPlaying}
    showMessage={showMessage}
    onReroll={rerollNow}
    rerollMode={rerollMode}
    parentDiceRollResult={parentDiceRollResult}
    isWaiting={isWaiting}
    setIsWaiting={setIsWaiting}
    battleInstanceKey={battleInstanceKey}
    turnIndex={turnIndex}
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
