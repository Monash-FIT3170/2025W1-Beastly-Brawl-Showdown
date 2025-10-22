import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleScene from "./BattleScene";
import { type ChooseMove } from "../../../../simulator/core/notice/notice";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";
import { useNavigate } from "react-router";


interface BattleScreenProps {
  matchData: {
    player1Monster: { template: MonsterTemplate; currentHp: number };
    player2Monster: { template: MonsterTemplate; currentHp: number };
    myId: number;
    roomId?: string;
    socketId?: string;
  };

  onSurrender: (playerId: number, roomId: string) => void;

  events: BaseEvent[];
  setEvents: React.Dispatch<React.SetStateAction<BaseEvent[]>>;
  chooseMove: ChooseMove | null;
  setChooseMove: React.Dispatch<React.SetStateAction<ChooseMove | null>>;
  setHasReceivedChooseMove: React.Dispatch<React.SetStateAction<boolean>>;
  buttonDisabled: boolean;
  onSubmitMove: (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    myMonsterId: EntryID
  ) => void;
  setTurnFinishedPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  showMessage: boolean;
  onReroll: (option: boolean) => void;
  rerollMode: boolean;
  parentDiceRollResult: number | null;
  isWaiting: boolean;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  battleInstanceKey: number;
  isSpectator?: boolean;
}

type MonsterState = {
  template: MonsterTemplate;
  currentHp: number;
  playerId: string;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({
  matchData,
  events,
  setEvents,
  chooseMove,
  setChooseMove,
  setHasReceivedChooseMove,
  buttonDisabled,
  onSubmitMove,
  setTurnFinishedPlaying,
  showMessage,
  onReroll,
  rerollMode,
  parentDiceRollResult,
  isWaiting,
  setIsWaiting,
  battleInstanceKey,
  isSpectator,
  onSurrender,
}) => {
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigate = useNavigate();

  //#region initializations
  useEffect(() => {
    if (!matchData) return;

    const isPlayer1 = matchData.myId === 0;

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
      playerId: matchData.myId.toString(),
    });
    setEnemyMonster({
      template: enemyMonsterData.template,
      currentHp:
        enemyMonsterData.currentHp ?? enemyMonsterData.template.baseStats.health,
      playerId: matchData.myId.toString(),
    });

    const snapshot = {
      name: "snapshot",
      type: "snapshot",
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

    setEvents([snapshot]);
  }, [matchData]);

  useEffect(() => {
    if (!matchData) return;
    setTurnIndex(0);
    setIsPlaying(true);
  }, [matchData]);

  const onAction = (moveId: EntryID, targetMethod: TargetingMethod) => {
    if (!myMonster) return;
    onSubmitMove(moveId, targetMethod, myMonster.template.templateId);
    setIsWaiting(true);
    setTurnFinishedPlaying(false);
    setHasReceivedChooseMove(false);
    setChooseMove(null);
  };

  //#region surrender
 const handleSurrender = async () => {
  console.log("=== [BATTLE SCREEN] SURRENDER DEBUG ===");
  console.log("matchData:", matchData);
  console.log("myMonster:", myMonster);
  console.log("enemyMonster:", enemyMonster);
  console.log("battleInstanceKey:", battleInstanceKey);

  // Check Player ID
  if (matchData?.myId !== undefined) {
    console.log("Player ID is valid:", matchData.myId);
  } else {
    console.warn("Player ID is undefined!");
  }

  // Check Room ID
  if (matchData?.roomId) {
    console.log("Room ID is valid:", matchData.roomId);
  } else {
    console.warn("Room ID is missing or undefined!");
  }

  // Check socket connection
  if ("socket" in matchData && matchData.socket) {
    console.log("Socket connected?", matchData.socket.connected);
  } else {
    console.warn("Socket is missing from matchData or not connected");
  }

  console.log("Calling onSurrender...");

  if (matchData?.myId !== undefined && matchData?.roomId) {
    await onSurrender(matchData.myId, matchData.roomId); // <-- waits for server ack
    console.log(`[BATTLE SCREEN] Surrender processed`);
  } else {
    console.warn("[BATTLE SCREEN] Cannot surrender: missing playerId or roomId");
  }

  console.log("Navigating back to /main");
  navigate("/main");
};



  //#endregion

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  if (isSpectator) {
    return (
      <div className="canvas-body" id="battle-screen-body">
        <BattleScene
          battleInstanceKey={battleInstanceKey}
          events={events}
          turnIndex={turnIndex}
          isPlaying={isPlaying}
          autoAdvance={false}
          onAdvanceTurn={(next) => setTurnIndex(next)}
          myId={matchData.myId}
          showMessage={showMessage}
          setTurnFinishedPlaying={setTurnFinishedPlaying}
          rerollMode={rerollMode}
          parentDiceRollResult={parentDiceRollResult}
          isWaiting={isWaiting}
        />
      </div>
    );
  }

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop onSurrender={handleSurrender} />
      <BattleScene
        battleInstanceKey={battleInstanceKey}
        events={events}
        turnIndex={turnIndex}
        isPlaying={isPlaying}
        autoAdvance={false}
        onAdvanceTurn={(next) => setTurnIndex(next)}
        myId={matchData.myId}
        showMessage={showMessage}
        setTurnFinishedPlaying={setTurnFinishedPlaying}
        rerollMode={rerollMode}
        parentDiceRollResult={parentDiceRollResult}
        isWaiting={isWaiting}
      />
      <BattleBottom
        onAction={onAction}
        disabled={buttonDisabled}
        chooseMove={chooseMove}
        fallbackMoves={{
          attack: myMonster.template.attackActionId,
          ability: myMonster.template.abilityActionId,
          defend: myMonster.template.defendActionId,
        }}
        onReroll={onReroll}
        rerollMode={rerollMode}
      />
    </div>
  );

  
};
