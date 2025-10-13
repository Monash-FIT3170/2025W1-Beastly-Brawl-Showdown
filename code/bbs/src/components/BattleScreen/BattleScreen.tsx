import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { DiceRollAnimation } from "./DiceRollAnimation";
import { usePlayerSocket } from "../player/game/PlayerPage";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleScene from "./BattleScene";
import { type ChooseMove, type Notice, type Roll } from "../../../../simulator/core/notice/notice";

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
  const [turnFinishedPlaying, setTurnFinishedPlaying] = useState(false);
  const [hasReceivedChooseMove, setHasReceivedChooseMove] = useState(false);
  const [chooseMove, setChooseMove] = useState<ChooseMove|null>(null);
  
  // Dice animation state
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState(20);

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

  //#region battle code

  //function that executes roll on server
  function rollNow(rollNotice: Roll): void {
    if (!socket) return;
    
    // Execute the roll on server immediately
    setShowMessage(false);
    socket.emit("requestRoll", rollNotice.kind);
    setRollNotice(null);
    setshowRollMessage(false);
    // Note: dice animation will be triggered when we receive the roll event back from server
  }

  // Handle dice animation completion - just hide the animation
  const handleDiceAnimationComplete = () => {
    setShowDiceAnimation(false);
  };

  //listen for enemy submitting messages
  useEffect(() => {
    if (!socket) return;

    const handleEnemySubmitted = () => {
      setshowEnemySubmittedMessage(true);
    };

    socket.on("enemyMoveSubmitted", handleEnemySubmitted);
    return () => {
      socket.off("enemyMoveSubmitted", handleEnemySubmitted);
    };
  }, [socket]);

  //notice handler for the 2 types of notices we have so far, reroll made need to be added later
  useEffect(() => {
    if (!socket) return;
    const handleNewNotice = (notice: Notice) => {
      console.log("Receiving Notice of type " + notice.kind)
      switch (notice.kind){
        case "roll": {
          setshowEnemySubmittedMessage(false);
          setshowSubmittedMoveMessage(false);
          setRollNotice(notice);
          setshowRollMessage(true);
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
          console.log("ERROR, UNHANDLED NOTICE TYPE");
          break;
        }
      }
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
    console.log("Handling Action now")
    const data = { moveId, targetMethod };
    socket.emit("submitMove", { data });
    setshowSubmittedMoveMessage(true)
    setbuttonDisabled(true)
    setChooseMove(null)
  };

  // GET READY TO UNLOCK BUTTON ON NEXT TURN
  useEffect(() => {
    if (!socket) return;

    const handleUnlock = () => {
      setTurnFinishedPlaying(false);
      setShowMessage(false);
      setshowSubmittedMoveMessage(false);
      setshowEnemySubmittedMessage(false);
    };

    socket.on("unlockButton", handleUnlock);
    return () => {
      socket.off("unlockButton", handleUnlock);
    };
  }, [socket]);

  //function to pass in new events to battle scene
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (ev: any) => {
      // Check if this is a roll event for the current player
      if (ev.name === "roll" && ev.source === matchData.myid) {
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
  }, [socket, matchData.myid]);

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  return (
    <>
      <div className="canvas-body" id="battle-screen-body">
        <BattleTop />
        <BattleScene
          events={events}
          turnIndex={turnIndex}
          isPlaying={isPlaying}
          autoAdvance={false}
          onAdvanceTurn={(next: React.SetStateAction<number>) => setTurnIndex(next)}
          myid={matchData.myid}
          showEnemySubmittedMessage={showEnemySubmittedMessage}
          showSubmittedMoveMessage={showSubmittedMoveMessage}
          showMessage={showMessage}
          setTurnFinishedPlaying={setTurnFinishedPlaying}
          showRollMessage={showRollMessage}
        />
        <BattleBottom
          onAction={handleAction}
          onRoll={() => rollNotice && rollNow(rollNotice)}
          disabled={buttonDisabled}
          mode={rollNotice ? "roll" : "combat"}
          chooseMove = {chooseMove}
          fallbackMoves={{
            attack: myMonster.template.attackActionId,
            ability: myMonster.template.abilityActionId,
            defend: myMonster.template.defendActionId,
          }}
        />
      </div>
      {/* Dice Roll Animation Overlay */}
      {showDiceAnimation && (
        <DiceRollAnimation
          onComplete={handleDiceAnimationComplete}
          rollResult={diceRollResult}
        />
      )}
    </>
  );
};