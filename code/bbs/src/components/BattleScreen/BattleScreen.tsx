import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleBottom } from "./BattleBottom";
import { type MonsterTemplate } from "../../../../simulator/core/monster/monster_template";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import BattleScene from "./BattleScene";
import {
  type ChooseMove,
} from "../../../../simulator/core/notice/notice";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";

interface BattleScreenProps {
  matchData: {
    player1Monster: { template: MonsterTemplate; currentHp: number };
    player2Monster: { template: MonsterTemplate; currentHp: number };
    myid: number;
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
  parentDiceRollResult : number | null;

  isWaiting: boolean;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  battleInstanceKey: number;
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
  battleInstanceKey
}) => {
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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
        enemyMonsterData.currentHp ??
        enemyMonsterData.template.baseStats.health,
      playerId: matchData.myid.toString(),
    });

    // Build snapshot JSON
    const snapshot = {
      name: "snapshot", // Ensure 'name' property is present for BaseEvent compatibility
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

    // put snapshot into events state as the first item
    setEvents([snapshot]);
  }, [matchData]);

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

  return (
    <>
      <div className="canvas-body" id="battle-screen-body">
        <BattleTop />
        <BattleScene
          battleInstanceKey={battleInstanceKey}
          events={events}
          turnIndex={turnIndex}
          isPlaying={isPlaying}
          autoAdvance={false}
          onAdvanceTurn={(next: React.SetStateAction<number>) =>
            setTurnIndex(next)
          }
          myid={matchData.myid}
          showMessage={showMessage}
          setTurnFinishedPlaying={setTurnFinishedPlaying}
          // showRollMessage={showRollMessage}
          rerollMode={rerollMode}
          parentDiceRollResult = {parentDiceRollResult}
          isWaiting={isWaiting}
        />
        <BattleBottom
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
          rerollMode = {rerollMode}
        />
      </div>
    </>
  );
};
