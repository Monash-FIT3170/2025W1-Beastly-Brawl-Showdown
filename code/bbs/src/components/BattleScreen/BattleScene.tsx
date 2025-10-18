import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseSnapshot } from "./Components/snapshot_parser";
import { parseTurns } from "./Components/turns_array_maker";
import { clamp } from "./Components/utils/clamp";
import type { BaseEvent } from "../../../../simulator/core/event/base_event";
import type {
  BuffEvent,
  DamageEvent,
  SnapshotEvent,
  MoveSuccessEvent,
  MoveFailedEvent,
  BlockedEvent,
  MoveEvadedEvent,
  RerollEvent,
  RollEvent,
} from "../../../../simulator/core/event/core_events";
import { getBaseStat } from "../../../../simulator/core/monster/monster";
import { COMMON_MONSTER_POOL } from "../../../../simulator/data/common/common_monster_pool";
import MonsterHealthRing from "./MonsterHealthRing";
import BattleMessage from "./BattleMessage";
import { DiceRollAnimation } from "./DiceRollAnimation";

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
  const [currentMessage, setcurrentMessage] = useState("");

  // === Animation state ===
  const [showAnimation, setShowAnimation] = useState(false);
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);

  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const enqueueAnim = (moveId: string, actor: "player1" | "player2") => {
    chainRef.current = chainRef.current.then(() =>
      performMoveAnimation(moveId, actor)
    );
  };

  // === Dice animation ===
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState<number | null>(null);

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
    setcurrentMessage("");
    setShowAnimation(false);
    setEnemySlash(false);
    setPlayerSlash(false);
    setEnemyShield(false);
    setPlayerShield(false);
    setEnemyAbility(false);
    setPlayerAbility(false);
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
    setcurrentMessage("");
  }, [initialTurnState, isPlaying]);

  // === Helper functions ===
  const getMoveDisplayName = (moveId: string, sourceId: number): string => {
    if (!currentSnapshot) return moveId;
    const sourceMonster = currentSnapshot.sides[sourceId].monster;
    const template =
      COMMON_MONSTER_POOL.monsters[
        sourceMonster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
      ];
    if (!template) return moveId;
    if (moveId === template.attackActionId) return "attack";
    if (moveId === template.defendActionId) return "defend";
    if (moveId === template.abilityActionId) return "ability";
    return moveId;
  };

  const getTemplateForSource = (sourceId: number) => {
    if (!currentSnapshot) return undefined;
    const src = currentSnapshot.sides[sourceId].monster;
    return COMMON_MONSTER_POOL.monsters[
      src.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
    ];
  };

  const performMoveAnimation = async (
    moveId: string,
    actor: "player1" | "player2"
  ) => {
    if (!currentSnapshot) return;
    const template =
      actor === "player1" ? getTemplateForSource(0) : getTemplateForSource(1);
    if (template) {
      if (moveId === template.attackActionId) {
        if (actor === "player1") setEnemySlash(true);
        else setPlayerSlash(true);
      } else if (moveId === template.defendActionId) {
        if (actor === "player1") setPlayerShield(true);
        else setEnemyShield(true);
      } else if (moveId === template.abilityActionId) {
        if (actor === "player1") setPlayerAbility(true);
        else setEnemyAbility(true);
      }
    }
    setShowAnimation(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowAnimation(false);
    if (actor === "player1") {
      setPlayerSlash(false);
      setPlayerShield(false);
      setPlayerAbility(false);
    } else {
      setEnemySlash(false);
      setEnemyShield(false);
      setEnemyAbility(false);
    }
  };

  // === Event application ===
  let previousEvent: BaseEvent | null = null;
  async function applyEventToVisible(
    state: typeof initialTurnState,
    ev: BaseEvent
  ) {
    switch (ev.name) {
      case "moveSuccess": {
        const successEvent = ev as MoveSuccessEvent;
        const isPlayer = successEvent.source === myId;
        const moveName = getMoveDisplayName(
          successEvent.moveId,
          successEvent.source
        );
        const message = isPlayer
          ? `You ${moveName} successfully!`
          : `Enemy ${moveName}s successfully!`;
        setcurrentMessage(message);
        enqueueAnim(successEvent.moveId, isPlayer ? "player1" : "player2");
        break;
      }
      case "moveFailed": {
        const failedEvent = ev as MoveFailedEvent;
        const isPlayer = failedEvent.source === myId;
        const moveName = getMoveDisplayName(
          failedEvent.moveId,
          failedEvent.source
        );
        let message = isPlayer
          ? `Your ${moveName} failed!`
          : `Enemy ${moveName} failed!`;
        if (failedEvent.moveId === "defend") {
          message += " No charges left!";
        }
        setcurrentMessage(message);
        break;
      }
      case "blocked": {
        const blockedEvent = ev as BlockedEvent;
        const isPlayerAttacking = blockedEvent.source === myId;

        const message = isPlayerAttacking
          ? "Your attack was blocked!"
          : "You blocked the enemy's attack!";

        setcurrentMessage(message);
        break;
      }
      case "evaded": {
        const evadedEvent = ev as MoveEvadedEvent;
        const isPlayerAttacking = evadedEvent.source === myId;

        const message = isPlayerAttacking
          ? "Your attack was evaded!"
          : "You evaded the enemy's attack!";

        setcurrentMessage(message);
        break;
      }
      case "damage": {
        const damageEvent = ev as DamageEvent;
        const isPlayerTakingDamage = damageEvent.target === myId;

        const message = isPlayerTakingDamage
          ? `You took ${damageEvent.amount} damage!`
          : `Enemy took ${damageEvent.amount} damage!`;

        setcurrentMessage(message);

        // Update health in state
        let playerId = Number(damageEvent.target);
        state[playerId].health -= damageEvent.amount;
        break;
      }
      case "buff": {
        const buffEvent = ev as BuffEvent;
        const isPlayer = buffEvent.source === myId;
        if (buffEvent.buffs.armour && buffEvent.source === buffEvent.target) {
          const message = isPlayer
            ? `You gained +${buffEvent.buffs.armour} armor!`
            : `Enemy gained +${buffEvent.buffs.armour} armor!`;
          setcurrentMessage(message);
          const actor = isPlayer ? "player1" : "player2";
          const template = getTemplateForSource(buffEvent.source);
          if (template) enqueueAnim(template.defendActionId, actor);
        }

        // Update defend charges in state
        let playerId = Number(buffEvent.source);
        state[playerId].defendActionCharge -= 1;
        break;
      }
      case "reroll": {
        const rerollEvent = ev as RerollEvent;
        if (rerollEvent.source === myId) {
          const message = `You would have rolled ${parentDiceRollResult} to hit but instead you rerolled and got ${rerollEvent.result}`;
          setcurrentMessage(message);
          // setDiceRollResult(rerollEvent.result);
          // setShowDiceAnimation(true);
        }
        break;
      }
      case "roll": {
        const rollEvent = ev as RollEvent;
        if (rollEvent.source === myId) {
          let message: string;
          switch (previousEvent?.name) {
            case "startMove": {
              message = `You rolled ${rollEvent.result} to hit`;
              break;
            }
            case "moveSuccess": {
              message = `You rolled ${rollEvent.result} to damage`;
              break;
            }
            default: {
              message = `You rolled ${rollEvent.result}`;
              break;
            }
          }
          setcurrentMessage(message);
        }
        break;
      }
      case "battleOver": {
        setcurrentMessage("Battle Over!");
        break;
      }
      default: {
        console.log(`Unhandled event: ${ev.name}`);
        break;
      }
    }
    previousEvent = ev;
    return state;
  }

  function cloneState(
    state: ReturnType<typeof parseSnapshot>
  ): ReturnType<typeof parseSnapshot> {
    if (typeof structuredClone === "function") {
      return structuredClone(state);
    } else {
      return JSON.parse(JSON.stringify(state));
    }
  }

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
      let animChain = Promise.resolve();
      for (; i < turnToPlay.length; i++) {
        if (cancelled) return;
        const ev = turnToPlay[i];
        const base = cloneState(latestVisibleRef.current);
        const next = await applyEventToVisible(base, ev);
        latestVisibleRef.current = next;
        setVisibleState(next);
        await new Promise((r) => setTimeout(r, 900));
        if (cancelled) return;
      }
      await animChain;
      lastSnapCountRef.current += 1;
      setTurnFinishedPlaying(true);
      setRunTurnNow(false);
      setTimeout(() => setcurrentMessage(""), 1200);
    })();
    return () => {
      cancelled = true;
    };
  }, [runTurnNow, isPlaying]);

  // Check if there are 2 players
  if (visibleState.length < 2) {
    return <p>Waiting for game data...</p>;
  }

  if (!currentSnapshot) {
    return null;
  }

  //have to get maxhp to pass to battlemiddle
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
          onComplete={() => setShowDiceAnimation(false)}
          rollResult={diceRollResult ?? 20}
        />
      )}
    </div>
  );
};

export default BattleScene;
