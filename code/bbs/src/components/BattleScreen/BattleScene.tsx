import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseSnapshot } from "./Components/snapshot_parser";
import { parseTurns } from "./Components/turns_array_maker";
import { clamp } from "./Components/utils/clamp";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";
import { getBaseStat } from "../../../../simulator/core/monster/monster";
import { COMMON_MONSTER_POOL } from "../../../../simulator/data/common/common_monster_pool";
import MonsterHealthRing from "./Components/MonsterHealthRing";
import BattleMessage from "./Components/BattleMessage";
import { DiceRollAnimation } from "./Components/Animations/DiceRollAnimation";
import { useBattleAnimations } from "./hooks/useBattleAnimations";
import { useBattleEvents } from "./hooks/useBattleEvents";
import type { SnapshotEvent } from "../../../../simulator/core/event/core_events";

interface BattleSceneProps {
  battleInstanceKey: number;
  events: BaseEvent[];
  turnIndex: number;
  isPlaying: boolean;
  autoAdvance?: boolean;
  onAdvanceTurn?: (nextIndex: number) => void;
  myId: number;
  showMessage: boolean;
  setTurnFinishedPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  rerollMode: boolean;
  parentDiceRollResult: number | null;
  isWaiting: boolean;
}

console.log("BattleScene loaded");

export const BattleScene: React.FC<BattleSceneProps> = ({
  battleInstanceKey,
  events,
  turnIndex,
  isPlaying,
  autoAdvance,
  onAdvanceTurn,
  myId,
  showMessage,
  setTurnFinishedPlaying,
  rerollMode,
  parentDiceRollResult,
  isWaiting,
}) => {
  // === Turn parsing and state ===
  const turns = useMemo(() => parseTurns(events), [events]);

  // === Animation logic handled by hook ===
  const {
    enemySlash,
    setEnemySlash,
    playerSlash,
    setPlayerSlash,
    enemyShield,
    setEnemyShield,
    playerShield,
    setPlayerShield,
    enemyAbility,
    setEnemyAbility,
    playerAbility,
    setPlayerAbility,
    enemyAbilityKind,
    playerAbilityKind,
    performMoveAnimation,
    resetAnimations,
  } = useBattleAnimations();

  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const enqueueAnim = (moveId: string, actor: "player1" | "player2") => {
    chainRef.current = chainRef.current.then(() =>
      performMoveAnimation(moveId, actor)
    );
  };

  // === Battle event handling hook ===
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState<number | null>(null);
  const [diceRollAnimationComplete, setDiceRollAnimationComplete] = useState<
    (() => void) | null
  >(null);

  const onDiceRoll = (roll: number) => {
    return new Promise<void>((resolve) => {
      setDiceRollResult(roll);
      setShowDiceAnimation(true);

      const handleComplete = () => {
        setShowDiceAnimation(false);
        resolve();
      };

      setDiceRollAnimationComplete(() => handleComplete);
    });
  };

  const { applyEventToVisible, currentMessage, setCurrentMessage, cloneState } =
    useBattleEvents({
      myId,
      parentDiceRollResult,
      enqueueAnim,
      showDiceRoll: onDiceRoll,
    });

  // === Turn index handling ===
  const selectedTurnIndex = Number.isInteger(turnIndex)
    ? clamp(turnIndex, 0, Math.max(0, turns.length - 1))
    : Math.max(0, turns.length - 1);

  const currentTurn = turns[selectedTurnIndex];
  const currentSnapshot = currentTurn ? currentTurn.getSnapshotEvent() : null;

  const initialTurnState = useMemo(
    () => (currentSnapshot ? parseSnapshot(currentSnapshot) : []),
    [currentSnapshot]
  );

  const [visibleState, setVisibleState] = useState(initialTurnState);
  const latestVisibleRef = useRef(initialTurnState);

  const [runTurnNow, setRunTurnNow] = useState(false);
  const lastSnapCountRef = useRef(0);
  const turnToPlayRef = useRef<BaseEvent[]>([]);

  const snapshotIdxs = useMemo(() => {
    const idxs: number[] = [];
    for (let i = 0; i < events.length; i++) {
      if (events[i]?.name === "snapshot") idxs.push(i);
    }
    return idxs;
  }, [events]);

  // Reset between battles
  const prevEventsRef = useRef(events);
  useEffect(() => {
    const isNewArray = prevEventsRef.current !== events;
    if (!isNewArray) return;
    lastSnapCountRef.current = 0;
    turnToPlayRef.current = [];
    chainRef.current = Promise.resolve();
    setCurrentMessage("");
    resetAnimations();
    setRunTurnNow(false);
    prevEventsRef.current = events;
  }, [battleInstanceKey]);

  // Determine if turn should play
  useEffect(() => {
    let completedTurns = snapshotIdxs.length - 1;
    if (lastSnapCountRef.current > completedTurns) {
      lastSnapCountRef.current = Math.max(0, completedTurns);
    }
    const alreadyPlayed = lastSnapCountRef.current;
    if (completedTurns <= alreadyPlayed) return;

    const start = snapshotIdxs[alreadyPlayed];
    const end = snapshotIdxs[alreadyPlayed + 1];
    turnToPlayRef.current = events.slice(start, end);
    setRunTurnNow(true);
  }, [snapshotIdxs, events]);

  // This is to prevent replaying the turn when autoplay is toggled
  const onAdvanceRef = useRef(onAdvanceTurn);
  useEffect(() => {
    onAdvanceRef.current = onAdvanceTurn;
  }, [onAdvanceTurn]);

  const autoAdvanceRef = useRef(autoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  // When the base snapshot changes (different selected turn), reset visible state
  useEffect(() => {
    setVisibleState(initialTurnState);
    latestVisibleRef.current = initialTurnState;
    setCurrentMessage("");
  }, [initialTurnState, isPlaying]);

  // === Turn playback ===
  useEffect(() => {
    if (!runTurnNow || !isPlaying) return;
    let cancelled = false;
    (async () => {
      const turnToPlay = turnToPlayRef.current;
      if (!turnToPlay.length) return;
      let i = 0;
      if (turnToPlay[0]?.name === "snapshot") {
        const snapState = parseSnapshot(turnToPlay[0] as SnapshotEvent);
        latestVisibleRef.current = snapState;
        setVisibleState(snapState);
        i = 1;
      }
      for (; i < turnToPlay.length; i++) {
        if (cancelled) return;
        const ev = turnToPlay[i];
        const base = cloneState(latestVisibleRef.current); // hook version
        const next = await applyEventToVisible(base, ev); // hook version
        latestVisibleRef.current = next;
        setVisibleState(next);
        await new Promise((r) => setTimeout(r, 900));
        if (cancelled) return;
      }
      lastSnapCountRef.current += 1;
      setTurnFinishedPlaying(true);
      setRunTurnNow(false);
      setTimeout(() => setCurrentMessage(""), 1500); // hook version
    })();
    return () => {
      cancelled = true;
    };
  }, [runTurnNow, isPlaying]);

  if (visibleState.length < 2) return <p>Waiting for game data...</p>;
  if (!currentSnapshot) return null;

  const template =
    COMMON_MONSTER_POOL.monsters[
      currentSnapshot.sides[myId].monster
        .baseID as keyof typeof COMMON_MONSTER_POOL.monsters
    ];
  const player1MaxHp = template ? getBaseStat("health", template) : 0;

  const template2 =
    COMMON_MONSTER_POOL.monsters[
      currentSnapshot.sides[1 - myId].monster
        .baseID as keyof typeof COMMON_MONSTER_POOL.monsters
    ];
  const player2MaxHp = template2 ? getBaseStat("health", template2) : 0;

  const visiblePlayer1 = visibleState[myId];
  const visiblePlayer2 = visibleState[1 - myId];
  const myMonsterImage = visiblePlayer1.image;
  const enemyMonsterImage = visiblePlayer2.image;
  const shouldShowMessage = showMessage || currentMessage !== "";

  return (
    <div className="canvas-body" id="battle-screen-body">
      <div className="combat-arena">
        <MonsterHealthRing
          currentHealth={visiblePlayer2.health ?? 0}
          maxHealth={player2MaxHp}
          imageSrc={enemyMonsterImage}
          showSlash={enemySlash}
          onSlashComplete={() => setEnemySlash(false)}
          showShield={enemyShield}
          onShieldComplete={() => setEnemyShield(false)}
          showAbility={enemyAbility}
          abilityKind={enemyAbilityKind}
          onAbilityComplete={() => setEnemyAbility(false)}
          monsterName={template2.name}
          baseStats={{
            attack: template2.baseStats.attack,
            defense: template2.baseStats.armour,
          }}
          abilityName={template2.abilityName}
        />
        <MonsterHealthRing
          currentHealth={visiblePlayer1.health ?? 0}
          maxHealth={player1MaxHp}
          imageSrc={myMonsterImage}
          showSlash={playerSlash}
          onSlashComplete={() => setPlayerSlash(false)}
          showShield={playerShield}
          onShieldComplete={() => setPlayerShield(false)}
          showAbility={playerAbility}
          abilityKind={playerAbilityKind}
          onAbilityComplete={() => setPlayerAbility(false)}
          monsterName={template.name}
          baseStats={{
            attack: template.baseStats.attack,
            defense: template.baseStats.armour,
          }}
          abilityName={template.abilityName}
        />
      </div>

      {rerollMode && (
        <BattleMessage
          message={`You rolled ${parentDiceRollResult} to hit. Would you like to reroll?`}
        />
      )}
      {isWaiting && !rerollMode && !runTurnNow && (
        <BattleMessage message="Wating for Enemy..." />
      )}
      {shouldShowMessage && <BattleMessage message={currentMessage} />}
      {showDiceAnimation && (
        <DiceRollAnimation
          rollResult={diceRollResult ?? 20}
          onComplete={() => {
            if (diceRollAnimationComplete) diceRollAnimationComplete();
          }}
        />
      )}
    </div>
  );
};

export default BattleScene;
