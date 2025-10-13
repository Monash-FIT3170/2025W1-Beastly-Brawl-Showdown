import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseSnapshot } from "./snapshot_parser";
import { parseTurns } from "./turns_array_maker";
import { clamp } from "./utils/clamp";
import { BaseEvent } from "../../../../core/event/base_event";
import { BuffEvent, DamageEvent } from "../../../../core/event/core_events";
import { getBaseStat } from "../../../../core/monster/monster";
import { COMMON_MONSTER_POOL } from "../../../../data/common/common_monster_pool";
import BattleMessage from "../BattleScreen/BattleMessage";
import { BattleMiddle } from "../BattleScreen/BattleMiddle";

interface BattleSceneProps {
  events: BaseEvent[];
  turnIndex: number;
  isPlaying: boolean;
  autoAdvance?: boolean; // play subsequent turns automatically
  onAdvanceTurn?: (nextIndex: number) => void; // ask parent to move to next turn
}

console.log("BattleScene loaded");

const BattleScene: React.FC<BattleSceneProps> = ({
  events,
  turnIndex,
  isPlaying,
  autoAdvance,
  onAdvanceTurn,
}) => {
  //setup the battle messages
  const [currentMessage, setcurrentMessage] = useState("");

  // Build turns from raw events
  const turns = useMemo(() => parseTurns(events), [events]);

  // Clamp selected index
  const selectedTurnIndex =
    Number.isInteger(turnIndex)
      ? clamp(turnIndex, 0, Math.max(0, turns.length - 1))
      : Math.max(0, turns.length - 1);

  // Determine the current turn and its start-of-turn snapshot
  const currentTurn = turns[selectedTurnIndex];
  const currentSnapshot = currentTurn ? currentTurn.getSnapshotEvent() : null;

  // Parsed snapshot at the start of the selected turn
  const initialTurnState = useMemo(
    () => (currentSnapshot ? parseSnapshot(currentSnapshot) : []),
    [currentSnapshot] // <- stable driver
  );

  // What the panels currently show as events are applied
  const [visibleState, setVisibleState] = useState(initialTurnState);

  // Keep a ref to avoid stale closures inside the async loop
  const latestVisibleRef = useRef(initialTurnState);

  // This is to prevent replaying the turn when autoplay is toggled
  const onAdvanceRef = useRef(onAdvanceTurn);
  useEffect(() => { onAdvanceRef.current = onAdvanceTurn; }, [onAdvanceTurn]);
  const autoAdvanceRef = useRef(autoAdvance);
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);

  // When the base snapshot changes (different selected turn), reset visible state
  useEffect(() => {
    setVisibleState(initialTurnState);
    latestVisibleRef.current = initialTurnState;
  }, [initialTurnState, isPlaying]);

  // Updates the visible state based on the event
  function applyEventToVisible(state: typeof initialTurnState, ev: BaseEvent) {
    switch (ev.name) {
      case "buff": {
      // Cast the event to a BuffEvent
      let buffEvent = ev as BuffEvent;
      // Get the id of the player who used the buff
      let playerId = Number(buffEvent.source);

      // Decrease the player's defense charges
      state[playerId].defendActionCharge -= 1;
      setcurrentMessage(`${playerId} has defended`);
      break;
      }

      case "damage": {
        // Cast the event to a DamageEvent
      let damageEvent = ev as DamageEvent;
      // Get the id of the player who was damaged
      let playerId = Number(damageEvent.target);

      // Decrease the player's health
      state[playerId].health -= damageEvent.amount;
      setcurrentMessage(`${playerId} has taken ${damageEvent.amount} damage`);
      break;
      }

      case "battleOver": {
        // TODO
        break;
      }
      case "roll": {
        // TODO
        break;
      }
      case "reroll": {
        // TODO
        break;
      }
      case "blocked": {
        // TODO
        break;
      }
      case "startMove": {
        // TODO
        break;
      }
      case "moveSuccess": {
        // TODO
        break;
      }
      case "evaded": {
        // TODO
        break;
      }
      case "moveFailed": {
        // TODO
        break;
      }

      default: {
        // TODO: unhandled event type
        break;
      }
    }

    return state; // placeholder
  }

  function cloneState(state: ReturnType<typeof parseSnapshot>): ReturnType<typeof parseSnapshot> {
    // Check if this built in function exists
    if (typeof structuredClone === "function") {
      return structuredClone(state);
    } else {
      return JSON.parse(JSON.stringify(state));
    }
  }

  // Step through events of the selected turn and update the panels live
  useEffect(() => {
    if (!currentTurn) return;

    // Check if is playing
    if (!isPlaying) return;

    // Make cancel false at the start of each turn's playthrough
    let cancelled = false;
    const perEventDelayMs = 600;

    // Play out events
    (async () => {
      for (const ev of currentTurn.turnEvents) {
        // Check for cancel
        if (cancelled) return;

        // Make copy to update
        const stateCopy = cloneState(latestVisibleRef.current);
        const nextState = applyEventToVisible(stateCopy, ev)

        // Update live
        setVisibleState(nextState);
        // Update ref
        latestVisibleRef.current = nextState;

        // Delay between events (Could be to put animations or this could be done in applyEventToVisible)
        await new Promise(r => setTimeout(r, perEventDelayMs));
        if (cancelled) return;
      }

      // What to do after this turn's playthrough is done
      if (!cancelled && autoAdvanceRef.current && onAdvanceRef.current && selectedTurnIndex < turns.length - 1) {
        onAdvanceRef.current(selectedTurnIndex + 1);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedTurnIndex, currentTurn, isPlaying]);



  // Check if there are 2 players
  if (visibleState.length < 2) {
    return <p>Waiting for game data...</p>;
  }
  
  if (!currentSnapshot) {
  return null; // or a loading/fallback state
  }

  //have to get maxhp to pass to battlemiddle
  //key of type of I hate this
  const template = COMMON_MONSTER_POOL.monsters[currentSnapshot.sides[0].monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters];
  const player1MaxHp = template ? getBaseStat("health", template) : 0;

  const template2 = COMMON_MONSTER_POOL.monsters[currentSnapshot.sides[1].monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters];
  const player2MaxHp = template2 ? getBaseStat("health", template2) : 0;

  // Clear names for what the UI reads:
  const visiblePlayer1 = visibleState[0];
  const visiblePlayer2 = visibleState[1];

  // console.log(visiblePlayer1.image);
  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleMiddle
        //showAnimation={showAnimation}
        enemyHp={visiblePlayer2.health ?? 0}
        enemyMaxHp = {player2MaxHp}
        playerHp={visiblePlayer1.health ?? 0}
        playerMaxHp = {player1MaxHp}
        enemyImgSrc={visiblePlayer2.image}
        playerImgSrc={visiblePlayer1.image}
      />
      <BattleMessage message = {currentMessage} />
    </div>
  );
};

export default BattleScene;
