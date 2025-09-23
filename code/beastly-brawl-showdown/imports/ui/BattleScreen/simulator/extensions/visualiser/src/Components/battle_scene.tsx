import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseSnapshot } from "./snapshot_parser";
import { parseTurns } from "./turns_array_maker";
import { clamp } from "./utils/clamp";
import { BaseEvent } from "../../../../core/event/base_event";
import { BuffEvent, DamageEvent, SnapshotEvent } from "../../../../core/event/core_events";
import { getBaseStat } from "../../../../core/monster/monster";
import { COMMON_MONSTER_POOL } from "../../../../data/common/common_monster_pool";
import { BattleMiddle } from "../BattleScreen/BattleMiddle";
import BattleMessage from "../BattleScreen/BattleMessage";
interface BattleSceneProps {
  events: BaseEvent[];
  turnIndex: number;
  isPlaying: boolean;
  autoAdvance?: boolean; // play subsequent turns automatically
  onAdvanceTurn?: (nextIndex: number) => void; // ask parent to move to next turn
  myid : number;
  showEnemySubmittedMessage: boolean;
  showSubmittedMoveMessage: boolean;
  showMessage: boolean;
}

console.log("BattleScene loaded");

export const BattleScene: React.FC<BattleSceneProps> = ({
  events,
  turnIndex,
  isPlaying,
  autoAdvance,
  onAdvanceTurn,
  myid,
  showEnemySubmittedMessage,
  showSubmittedMoveMessage,
  showMessage,
}) => {

  // Build turns from raw events
  const turns = useMemo(() => parseTurns(events), [events]);

  //setup the battle messages
  const [currentMessage, setcurrentMessage] = useState("");

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
  }, [events.length]);

  // useeffect to know when to play the turn
  useEffect(() => {
    // # of completed turns = snapshots - 1 (first snapshot has no prior turn)
    const completedTurns = snapshotIdxs.length - 1;
    const alreadyPlayed = lastSnapCountRef.current;

    if (completedTurns <= alreadyPlayed) return; // nothing new to play

    const start = snapshotIdxs[alreadyPlayed];
    const end = snapshotIdxs[alreadyPlayed + 1]; // the new snapshot
    turnToPlayRef.current = events.slice(start, end);  // freeze the exact turn
    setRunTurnNow(true);
  }, [snapshotIdxs, events]); // events needed to slice; OK since we gate on snapshot count


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

  //currentmessage is the battle message you need to look at
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
    if (!runTurnNow) return;
    if (!isPlaying) return;

    let cancelled = false;

    (async () => {
      const turnToPlay = turnToPlayRef.current;
      if (!turnToPlay.length) return;

      // Reset to the snapshot at start of the slice
      let i = 0;
      if (turnToPlay[0]?.name === "snapshot") {
        const snapState = parseSnapshot(turnToPlay[0] as SnapshotEvent);
        latestVisibleRef.current = snapState;
        setVisibleState(snapState);
        i = 1;
      }

      // Apply the rest of the events in this completed turn
      for (; i < turnToPlay.length; i++) {
        if (cancelled) return;
        const ev = turnToPlay[i];

        const base = cloneState(latestVisibleRef.current);
        const next = applyEventToVisible(base, ev);
        console.log("Rendering:", ev.name)

        latestVisibleRef.current = next;
        setVisibleState(next);

        // When you add animations, put your delay here:
        // await new Promise(r => setTimeout(r, 600));
        // if (cancelled) return;
      }

      // Mark this turn as played and lower the flag
      lastSnapCountRef.current += 1;
      setRunTurnNow(false);
    })();

    return () => { cancelled = true; };
  }, [runTurnNow, isPlaying]);



  // Check if there are 2 players
  if (visibleState.length < 2) {
    return <p>Waiting for game data...</p>;
  }
  
  if (!currentSnapshot) {
  return null; // or a loading/fallback state
  }

  //have to get maxhp to pass to battlemiddle
  //key of type of I hate this
  //hp is being updated correctly so why isn't health updating?
  const template = COMMON_MONSTER_POOL.monsters[currentSnapshot.sides[0].monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters];
  const player1MaxHp = template ? getBaseStat("health", template) : 0;
  // console.log("my health is" + player1MaxHp)

  const template2 = COMMON_MONSTER_POOL.monsters[currentSnapshot.sides[1].monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters];
  const player2MaxHp = template2 ? getBaseStat("health", template2) : 0;
  // console.log("enemy health is" + player2MaxHp)

  // Clear names for what the UI reads:
  const visiblePlayer1 = visibleState[0];
  const visiblePlayer2 = visibleState[1];
  const myMonsterImage = visibleState[0].image;
  const enemyMonsterImage = visibleState[1].image;

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleMiddle
        //showAnimation={showAnimation}
        enemyHp={visiblePlayer2.health ?? 0}
        enemyMaxHp = {player2MaxHp}
        playerHp={visiblePlayer1.health ?? 0}
        playerMaxHp = {player1MaxHp}
        enemyImgSrc={enemyMonsterImage}
        playerImgSrc={myMonsterImage}
      />
      {showEnemySubmittedMessage && <BattleMessage message={"Enemy Has Submitted"} />}
      {showSubmittedMoveMessage && <BattleMessage message={"Your Move Has Been Submitted"} />}
      {showMessage && <BattleMessage message = {currentMessage} />}
    </div>
  );
};

export default BattleScene;
