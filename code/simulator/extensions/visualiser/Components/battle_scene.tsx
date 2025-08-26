import React, { useEffect, useMemo, useRef, useState } from "react";
import type { BaseEvent } from "../../../core/event/base_event";
import type { BuffEvent, DamageEvent } from "../../../core/event/core_events";
import { parseSnapshot } from "./snapshot_parser";
import { parseTurns } from "./turns_array_maker";
import { clamp } from "./utils/clamp";

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
      break;
      }

      case "damage": {
        // Cast the event to a DamageEvent
      let damageEvent = ev as DamageEvent;
      // Get the id of the player who was damaged
      let playerId = Number(damageEvent.target);

      // Decrease the player's health
      state[playerId].health -= damageEvent.amount;
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
      if (!cancelled && autoAdvance && onAdvanceTurn && selectedTurnIndex < turns.length - 1) {
        onAdvanceTurn(selectedTurnIndex + 1);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedTurnIndex, currentTurn, isPlaying, autoAdvance, onAdvanceTurn]);


  // Check if there are 2 players
  if (visibleState.length < 2) {
    return <p>Waiting for game data...</p>;
  }

  // Clear names for what the UI reads:
  const visiblePlayer1 = visibleState[0];
  const visiblePlayer2 = visibleState[1];

  // console.log(visiblePlayer1.image);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "300px",
        border: "1px solid black",
      }}
    >
      {/* Left Panel (PLAYER 1) */}
      <div style={{ flex: 3, backgroundColor: "#d0e6ff", padding: "20px" }}>
        <h2>{visiblePlayer1.name}</h2>
        <p>HP: {visiblePlayer1.health}</p>
        <p>Defend Charges: {visiblePlayer1.defendActionCharge}</p>
        {/* <img src={visiblePlayer1.image} /> */}
      </div>

      {/* Right Panel (PLAYER 2) */}
      <div style={{ flex: 3, backgroundColor: "#ffd0d0", padding: "20px" }}>
        <h2>{visiblePlayer2.name}</h2>
        <p>HP: {visiblePlayer2.health}</p>
        <p>Defend Charges: {visiblePlayer2.defendActionCharge}</p>
        {/* <img src={visiblePlayer2.image} /> */}
      </div>
    </div>
  );
};

export default BattleScene;
