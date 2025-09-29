import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { usePlayerSocket } from "../player/game/PlayerPage";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleMessage from "./BattleMessage";
import { type DamageEvent } from "../../../../simulator/core/event/core_events";
import { type Notice } from "../../../../simulator/core/notice/notice";

interface BattleScreenProps {
  matchData: {
    player1Monster: { template: MonsterTemplate; currentHp: number };
    player2Monster: { template: MonsterTemplate; currentHp: number };
    myid: number;
  };
}

type MonsterState = {
  template: MonsterTemplate;
  currentHp: number;
  playerId: string;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({ matchData }) => {
  const { socket } = usePlayerSocket();
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();
  const [buttonDisabled, setbuttonDisabled] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [rollNotice, setRollNotice] = useState<Roll | null>(null);
  const [showEnemySubmittedMessage, setshowEnemySubmittedMessage] = useState(false);
  const [showSubmittedMoveMessage, setshowSubmittedMoveMessage] = useState(false);
  const [showRollMessage, setshowRollMessage] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [turnFinishedPlaying, setTurnFinishedPlaying] = useState(false)
  const [hasReceivedChooseMove, setHasReceivedChooseMove] = useState(false);

  //#region initializations
  // Initialize monsters when matchData changes
  useEffect(() => {
    if (!matchData) return;

    const isPlayer1 = matchData.myid === 0;

    const myMonsterData = isPlayer1
      ? matchData.player1Monster
      : matchData.player2Monster;

    const enemyMonsterData = isPlayer1
      ? matchData.player2Monster
      : matchData.player1Monster;
      
    setMyMonster({
      template: myMonsterData.template,
      currentHp:
        myMonsterData.currentHp ?? myMonsterData.template.baseStats.health,
      playerId: matchData.myid.toString(),  
    });
    setEnemyMonster({
      template: enemyMonsterData.template,
      currentHp:
        enemyMonsterData.currentHp ?? enemyMonsterData.template.baseStats.health,
      playerId: matchData.myid.toString(),
    });

    // Build snapshot JSON
    const snapshot = {
      name: "snapshot",
      sides: [
        {
          id: 0,
          monster: {
            baseID: matchData.player1Monster.template.templateId,
            health:
              matchData.player1Monster.currentHp ??
              matchData.player1Monster.template.baseStats.health,
            defendActionCharges: 0,
            components: [],
          },
          pendingActions: null,
        },
        {
          id: 1,
          monster: {
            baseID: matchData.player2Monster.template.templateId,
            health:
              matchData.player2Monster.currentHp ??
              matchData.player2Monster.template.baseStats.health,
            defendActionCharges: 0,
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

  //#region battle code

  //function that callsback rolls
  function rollNow(rollNotice : Roll): void {
  if (!socket) return;
  setShowMessage(false)
  const params: Parameters<typeof rollNotice.callback> = [];
  socket.emit("requestRoll", rollNotice.kind, params);
  setRollNotice(null)
  setshowRollMessage(false)
}

 //listen for enemy submitting messages
  useEffect(() => {
  if (!socket) return;

  const handleEnemySubmitted = () => {
    setshowEnemySubmittedMessage(true)
  };

  socket.on("EnemySubmitted", handleEnemySubmitted);
  return () => {
    socket.off("EnemySubmitted", handleEnemySubmitted);
  }
}, [socket]);

  //notice handler for the 2 types of notices we have so far, reroll made need to be added later
  useEffect(() => {
    if (!socket) return;
    const handleNewNotice = (notice: Notice) => {
      if (notice.kind === "roll") {
        setshowEnemySubmittedMessage(false);
        setshowSubmittedMoveMessage(false);
        setRollNotice(notice);
        setshowRollMessage(true)
      }
      if (notice.kind === "chooseMove")
        setHasReceivedChooseMove(true);
    };
    socket.on("newNotice", handleNewNotice);
    return () => {
      socket.off("newNotice", handleNewNotice);
    };
  }, [socket]);

  //only disable button if there is a choosemove waiting, and turn has finished playing
  useEffect(() => {
    if (hasReceivedChooseMove && turnFinishedPlaying) {
      setbuttonDisabled(false);
    }
  }, [hasReceivedChooseMove, turnFinishedPlaying]);

  // Handle player action (submit move to server)
  const handleAction = (
    moveId: EntryID,
    targetMethod: TargetingMethod
  ) => {
    if (!socket || !myMonster) return;

    const data = { moveId, targetMethod };
    socket.emit("RequestSubmitMove", { data });
    setshowSubmittedMoveMessage(true)
    setbuttonDisabled(true)
  };

  // GET READY TO UNLOCK BUTTON ON NEXT TURN
  useEffect(() => {
    if (!socket) return;

    const handleUnlock = () => {
      setTurnFinishedPlaying(false)
      setShowMessage(false);
      setshowSubmittedMoveMessage(false);
      setshowEnemySubmittedMessage(false)
    };

    socket.on("UnlockButton", handleUnlock);
    return () => {
      socket.off("UnlockButton", handleUnlock);
    };
  }, [socket]);

  //function to pass in new events to battle scene
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (ev: any) => {
      setEvents(prev => {
      const next = [...prev, ev];
      return next;
    });
    };

    socket.on("newEvent", handleNewEvent);
    return () => {
      socket.off("newEvent", handleNewEvent);
    }
  }, [socket]);


  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />
      <BattleScene
        events={events}
        turnIndex={turnIndex}
        isPlaying={isPlaying}
        autoAdvance={false}  // default: no autoplay
        onAdvanceTurn={(next) => setTurnIndex(next)}
        myid = {matchData.myid}
        showEnemySubmittedMessage = {showEnemySubmittedMessage}
        showSubmittedMoveMessage = {showSubmittedMoveMessage}
        showMessage = {showMessage}
        setTurnFinishedPlaying={setTurnFinishedPlaying}
        showRollMessage = {showRollMessage}
      />
      <BattleBottom
        onAction={handleAction}
        onRoll={() => rollNotice && rollNow(rollNotice)}
        disabled={buttonDisabled}
        myMonsterMoves={{
          attack: myMonster.template.attackActionId,
          ability: myMonster.template.abilityActionId,
          defend: myMonster.template.defendActionId,
        }}
        mode={rollNotice ? "roll" : "combat"}
      />
    </div>
  );
};
