import React, { useEffect, useMemo, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleScene from "./BattleScene";
import { type ChooseMove} from "../../../../simulator/core/notice/notice";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";
import { parseTurns } from "./Components/turns_array_maker";
import { clamp } from "./Components/utils/clamp";


type MonsterState = {
  template: MonsterTemplate;
  currentHp: number;
  playerId: string;
};

interface BattleScreenProps {
  matchData: {
    player1Monster: { template: MonsterTemplate; currentHp: number };
    player2Monster: { template: MonsterTemplate; currentHp: number };
    myId: number;
  };
  events: BaseEvent[];
  setEvents: React.Dispatch<React.SetStateAction<BaseEvent[]>>;

  chooseMove: ChooseMove | null;
  setChooseMove: React.Dispatch<React.SetStateAction<ChooseMove | null>>;
  setHasReceivedChooseMove: React.Dispatch<React.SetStateAction<boolean>>;

  // rollNotice: Roll | null;
  // showRollMessage: boolean;

  buttonDisabled: boolean;

  onSubmitMove: (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    myMonsterId: EntryID
  ) => void;
  // onRoll: (rollNotice: Roll) => void;

  setTurnFinishedPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  showMessage: boolean;

  onReroll: (option: boolean) => void;
  rerollMode: boolean
  parentDiceRollResult: number | null;

  isWaiting: boolean;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  battleInstanceKey: number;
  isSpectator?: boolean;
}



export const BattleScreen: React.FC<BattleScreenProps> = ({
  matchData,
  events,
  setEvents,
  chooseMove,
  setChooseMove,
  setHasReceivedChooseMove,
  // rollNotice,
  // showRollMessage,
  buttonDisabled,
  onSubmitMove,
  // onRoll,
  setTurnFinishedPlaying,
  showMessage,
  onReroll,
  rerollMode,
  parentDiceRollResult,
  isWaiting,
  setIsWaiting,
  battleInstanceKey,
  isSpectator
}) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();

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
        enemyMonsterData.currentHp ??
        enemyMonsterData.template.baseStats.health,
      playerId: matchData.myId.toString(),
    });
  }, [matchData]);
    

  // === Turn parsing and state ===
  const turns = useMemo(() => parseTurns(events), [events]);

  useEffect(() => {
    // Auto-advance to the latest turn when new turns are available
    if (turns.length > 0) {
      setTurnIndex(turns.length - 1);
    }
  }, [turns.length]);

  const currentTurn = turns[turnIndex];
  const currentSnapshot = currentTurn ? currentTurn.getSnapshotEvent() : null;
  console.log("CURRENT SNAPSHOT IS")
  console.log(currentSnapshot)

  useEffect(() => {
    console.log("🌀 events updated. Length:", events.length);
  }, [events]);

  const currentAttackCharges = currentSnapshot ? currentSnapshot.sides[matchData.myId].monster.attackCharges : null;

  useEffect(() => {
    console.log("⚔️ currentAttackCharges", currentAttackCharges);
  }, [currentAttackCharges]);



  // Whenever there is new matchdata, reset the turn index
  useEffect(() => {
    if (!matchData) return;
    setTurnIndex(0);
    setIsPlaying(true);
  }, [matchData]);

  const onAction = (moveId: EntryID, targetMethod: TargetingMethod) => {
    if (!myMonster) return;
    onSubmitMove(moveId, targetMethod, myMonster.template.templateId);
    setIsWaiting(true)
    setTurnFinishedPlaying(false);
    setHasReceivedChooseMove(false);
    setChooseMove(null);
  };

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  if (isSpectator) {
  return (
    <>
      <div className="canvas-body" id="battle-screen-body">
        <BattleScene
          battleInstanceKey={battleInstanceKey}
          turns = {turns}
          currentSnapshot = {currentSnapshot}
          events={events}
          turnIndex={turnIndex}
          isPlaying={isPlaying}
          autoAdvance={false}
          onAdvanceTurn={(next: React.SetStateAction<number>) =>
            setTurnIndex(next)
          }
          myId={matchData.myId}
          showMessage={showMessage}
          setTurnFinishedPlaying={setTurnFinishedPlaying}
          // showRollMessage={showRollMessage}
          rerollMode={rerollMode}
          parentDiceRollResult={parentDiceRollResult}
          isWaiting={isWaiting}
        />
      </div>
    </>
  );
}
  
  return (
    <>
      <div className="canvas-body" id="battle-screen-body">
        <BattleTop />
        <BattleScene
          events={events}
          battleInstanceKey={battleInstanceKey}
          turns = {turns}
          currentSnapshot = {currentSnapshot}
          turnIndex={turnIndex}
          isPlaying={isPlaying}
          autoAdvance={false}
          onAdvanceTurn={(next: React.SetStateAction<number>) =>
            setTurnIndex(next)
          }
          myId={matchData.myId}
          showMessage={showMessage}
          setTurnFinishedPlaying={setTurnFinishedPlaying}
          // showRollMessage={showRollMessage}
          rerollMode={rerollMode}
          parentDiceRollResult={parentDiceRollResult}
          isWaiting={isWaiting}
        />
        <BattleBottom
          currentAttackCharges = {currentAttackCharges}
          onAction={onAction}
          // onRoll={() => rollNotice && onRoll(rollNotice)}
          disabled={buttonDisabled}
          // mode={rollNotice ? "roll" : "combat"}
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
    </>
  );
};
