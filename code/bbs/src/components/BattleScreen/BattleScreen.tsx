import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleScene from "./BattleScene";
import { type ChooseMove, type Roll } from "../../../../simulator/core/notice/notice";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";

interface BattleScreenProps {
  matchData: {
    player1: { name: string; monster: { template: MonsterTemplate; currentHp: number } };
    player2: { name: string; monster: { template: MonsterTemplate; currentHp: number } };
    myId: number;
  };
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
  rerollMode: boolean
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
   rollNotice,
   showRollMessage,
   buttonDisabled,
   showDiceAnimation,
   diceRollResult,
   setShowDiceAnimation ,
   onSubmitMove,
   onRoll,
   setTurnFinishedPlaying,
   showEnemySubmittedMessage,
   setShowSubmittedMoveMessage,
   showSubmittedMoveMessage,
   showMessage,
   battleInstanceKey,
   isSpectator
  }) => {
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  //#region initializations
  // Initialize monsters when matchData changes
  useEffect(() => {
    if (!matchData) return;
    console.log("Initializing monsters with matchData:", { matchData });

    const isPlayer1 = matchData.myId === 0;

    const myMonsterData = isPlayer1
      ? matchData.player1.monster
      : matchData.player2.monster;

    const enemyMonsterData = isPlayer1
      ? matchData.player2.monster
      : matchData.player1.monster;

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

  // Whenever there is new matchdata, reset the turn index
  useEffect(() => {
    if (!events || events.length === 0) return;
    setIsPlaying(true);
  }, [matchData, battleInstanceKey, events]);

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
    <BattleScene
      battleInstanceKey={battleInstanceKey}
      events={events}
      turnIndex={turnIndex}
      isPlaying={isPlaying}
      autoAdvance={false}
      onAdvanceTurn={() => {}}
      myid={matchData.myid}
      showEnemySubmittedMessage={false}
      showSubmittedMoveMessage={false}
      showMessage={false}
      setTurnFinishedPlaying={() => {}}
      showRollMessage={false}
    />
  );
}
  
  return (
    <>
      <div className="canvas-body" id="battle-screen-body">
        <BattleTop
          turnNumber={turnIndex + 1}
          playerName={matchData.myId === 0 ? matchData.player1.name : matchData.player2.name}
          opponentName={matchData.myId === 0 ? matchData.player2.name : matchData.player1.name}
        />
        <BattleScene
          battleInstanceKey={battleInstanceKey}
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
    </>
  );
};
