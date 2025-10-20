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
import { BattleMiddle } from "./BattleMiddle";
import BattleMessage from "./BattleMessage";
import { DiceRollAnimation } from "./DiceRollAnimation";

interface BattleSceneProps {
  battleInstanceKey: number
  events: BaseEvent[];
  turnIndex: number;
  isPlaying: boolean;
  autoAdvance?: boolean; // play subsequent turns automatically
  onAdvanceTurn?: (nextIndex: number) => void; // ask parent to move to next turn
  myId: number;
  showMessage: boolean;
  setTurnFinishedPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  // showRollMessage: boolean;
  rerollMode: boolean
  parentDiceRollResult : number | null;
  isWaiting:boolean;
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
  // showRollMessage,
  rerollMode,
  parentDiceRollResult,
  isWaiting

}) => {
  // Build turns from raw events
  const turns = useMemo(() => parseTurns(events), [events]);

  //setup the battle messages
  const [currentMessage, setcurrentMessage] = useState("");

  // === Animation state (migrated from BattleScreen) ===
  const [showAnimation, setShowAnimation] = useState(false);
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);

  // animation sequencing (same pattern as BattleScreen)
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueAnim = (moveId: string, actor: "player1" | "player2") => {
    chainRef.current = chainRef.current.then(() =>
      performMoveAnimation(moveId, actor)
    );
  };

  // Dice roll animation state
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [diceRollResult, setDiceRollResult] = useState<number | null>(null);

  // Clamp selected index
  const selectedTurnIndex = Number.isInteger(turnIndex)
    ? clamp(turnIndex, 0, Math.max(0, turns.length - 1))
    : Math.max(0, turns.length - 1);

  // Determine the current turn and its start-of-turn snapshot
  const currentTurn = turns[selectedTurnIndex];
  const currentSnapshot = currentTurn ? currentTurn.getSnapshotEvent() : null;

  // Parsed snapshot at the start of the selected turn
  const initialTurnState = useMemo(
    () => (currentSnapshot ? parseSnapshot(currentSnapshot) : []),
    [currentSnapshot]
  );

  // What the panels currently show as events are applied
  const [visibleState, setVisibleState] = useState(initialTurnState);

  // Keep a ref to avoid stale closures inside the async loop
  const latestVisibleRef = useRef(initialTurnState);

  // New stuff to know when to play out the turn
  const [runTurnNow, setRunTurnNow] = useState(false);
  const lastSnapCountRef = useRef(0);
  const turnToPlayRef = useRef<BaseEvent[]>([]);

  // Keep track of the snapshot events' indices
  const snapshotIdxs = useMemo(() => {
    const idxs: number[] = [];
    for (let i = 0; i < events.length; i++) {
      if (events[i]?.name === "snapshot") idxs.push(i);
    }
    return idxs;
  }, [events]);

  const prevEventsRef = useRef(events);
  useEffect(() => {
    console.log('events identity changed:', prevEventsRef.current !== events);
    const isNewArray = prevEventsRef.current !== events;
    if (!isNewArray) return;

    // Reset everything between battles
    lastSnapCountRef.current = 0;
    turnToPlayRef.current = [];
    chainRef.current = Promise.resolve();

    // Reset UI state & messages
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

  // useeffect to know when to play the turn
  useEffect(() => {
    let completedTurns = snapshotIdxs.length - 1;
    console.log("EVENTS:", JSON.stringify(events))
    console.log(turns)

    // If our playback counter is ahead, reset it so it never blocks turns from running
    if (lastSnapCountRef.current > completedTurns) {
      lastSnapCountRef.current = Math.max(0, completedTurns);
    }

    const alreadyPlayed = lastSnapCountRef.current;
    console.log({ completedTurns, alreadyPlayed, snapshotIdxs });

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

  // Helper function to get move name from moveId
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

  // Helper to fetch the acting monster template by sourceId
  const getTemplateForSource = (sourceId: number) => {
    if (!currentSnapshot) return undefined;
    const src = currentSnapshot.sides[sourceId].monster;
    return COMMON_MONSTER_POOL.monsters[
      src.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
    ];
  };

  // === Perform the same animations BattleScreen had ===
  const performMoveAnimation = async (
    moveId: string,
    actor: "player1" | "player2"
  ) => {
    if (!currentSnapshot) return;

    const template =
      actor === "player1" ? getTemplateForSource(0) : getTemplateForSource(1);

    // Set which animation toggles to fire based on the moveId
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

    // Reset toggles like BattleScreen did
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

  // Keep track of the previous event
  let previousEvent: BaseEvent | null = null;

  // Updates the visible state based on the event
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
          switch (previousEvent?.name){
            case ("startMove") : {
              message = `You rolled ${rollEvent.result} to hit`;
              break
            }
            case ("startMove") : {
              message = `You rolled ${rollEvent.result} to damage`;
              break
            }
            default : {
              message = `You rolled ${rollEvent.result}`;
              break
            }
          }
          setcurrentMessage(message);
          // setDiceRollResult(rollEvent.result);
          // setShowDiceAnimation(true);
        }
        break;
      }

      case "battleOver": {
        setcurrentMessage("Battle Over!");
        break;
      }

      default: {
        // Handle unhandled event types
        console.log(`Unhandled event: ${ev.name}`);
        break;
      }
    }

    // Update previous event after processing
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

  // Step through events of the selected turn and update the panels live
  useEffect(() => {
    if (!runTurnNow || !isPlaying) return;

    let cancelled = false;

    (async () => {
      const turnToPlay = turnToPlayRef.current;
      if (!turnToPlay.length) return;

      // Reset to the snapshot at the start of the turn
      let i = 0;
      if (turnToPlay[0]?.name === "snapshot") {
        const snapState = parseSnapshot(turnToPlay[0] as SnapshotEvent);
        latestVisibleRef.current = snapState;
        setVisibleState(snapState);
        i = 1;
      }

      console.log("APPLYING EVENTS");
      let animChain = Promise.resolve();

      for (; i < turnToPlay.length; i++) {
        if (cancelled) return;

        const ev = turnToPlay[i];
        const base = cloneState(latestVisibleRef.current);
        const next = await applyEventToVisible(base, ev);
        latestVisibleRef.current = next;
        setVisibleState(next);

        console.log("Rendering:", ev.name);

        // Small delay between events
        await new Promise((r) => setTimeout(r, 900));
        if (cancelled) return;
      }

      // <-- WAIT FOR ALL ENQUEUED ANIMATIONS
      await animChain;

      lastSnapCountRef.current += 1;
      setTurnFinishedPlaying(true);
      console.log("Turn finished playing");

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

  // Clear names for what the UI reads:asd
  const visiblePlayer1 = visibleState[myId];
  const visiblePlayer2 = visibleState[1 - myId];
  const myMonsterImage = visibleState[myId].image;
  const enemyMonsterImage = visibleState[1 - myId].image;
  const shouldShowMessage = showMessage || currentMessage !== "";

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleMiddle
        enemyHp={visiblePlayer2.health ?? 0}
        enemyMaxHp={player2MaxHp}
        playerHp={visiblePlayer1.health ?? 0}
        playerMaxHp={player1MaxHp}
        enemyImgSrc={enemyMonsterImage}
        playerImgSrc={myMonsterImage}
        showAnimation={showAnimation}
        enemySlashVisible={enemySlash}
        onEnemySlashComplete={() => setEnemySlash(false)}
        playerSlashVisible={playerSlash}
        onPlayerSlashComplete={() => setPlayerSlash(false)}
        enemyShieldVisible={enemyShield}
        onEnemyShieldComplete={() => setEnemyShield(false)}
        playerShieldVisible={playerShield}
        onPlayerShieldComplete={() => setPlayerShield(false)}
        enemyAbilityVisible={enemyAbility}
        onEnemyAbilityComplete={() => setEnemyAbility(false)}
        playerAbilityVisible={playerAbility}
        onPlayerAbilityComplete={() => setPlayerAbility(false)}
        enemyMonsterName={template2.name}
        enemyBaseStats={{
          attack: template2.baseStats.attack,
          defense: template2.baseStats.armour,
        }}
        playerMonsterName={template.name}
        playerBaseStats={{
          attack: template.baseStats.attack,
          defense: template.baseStats.armour,
        }}
        enemyAbilityName={template2.abilityName}
        playerAbilityName={template.abilityName}
      />
      {rerollMode && (
        <BattleMessage message={`You rolled ${parentDiceRollResult} to hit. Would you like to reroll?`} />
      )}
      {isWaiting && !rerollMode && !runTurnNow &&(
        <BattleMessage message="Wating for Enemy..." />
      )}
      {/* {showRollMessage && <BattleMessage message={"Time To Roll!"} />} */}
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
