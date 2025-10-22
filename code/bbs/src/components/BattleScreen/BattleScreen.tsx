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
    roomId?: string; // optional room identifier if you have one
    socketId?: string; // optional
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
  isSpectator
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
        enemyMonsterData.currentHp ??
        enemyMonsterData.template.baseStats.health,
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

  // --- Added Surrender feature ---
  const handleSurrender = () => {
    console.log("Player surrendered:", matchData.myId, "Room:", matchData.roomId);

    // Example: send to backend or socket
    sendSurrenderEvent({
      playerId: matchData.myId,
      roomId: matchData.roomId,
      socketId: matchData.socketId,
    });

    navigate("/main"); // optional navigation
  };

  const sendSurrenderEvent = ({
    playerId,
    roomId,
    socketId
  }: {
    playerId: number;
    roomId?: string;
    socketId?: string;
  }) => {
    console.log("Sending surrender to backend:", { playerId, roomId, socketId });
    // replace with real backend API or socket emit
  };

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
      </div>
    );
  }

  return (
    <div className="canvas-body" id="battle-screen-body">
      {/* Pass the callback to BattleTop */}
      <BattleTop onSurrender={handleSurrender} />
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
  );
};
