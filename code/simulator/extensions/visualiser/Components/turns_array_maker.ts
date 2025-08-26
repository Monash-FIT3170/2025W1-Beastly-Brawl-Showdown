import type { BaseEvent } from "@beastly-brawl-showdown/sim-core/event/base_event";
import type { SnapshotEvent } from "@beastly-brawl-showdown/sim-core/event/core_events";
import { Turn } from "../turn";

export function parseTurns(events: BaseEvent[]): Turn[] {
  const turnArray: Turn[] = [];
  let currentTurn: Turn | null = null;
  for (const event of events) {
    if (event.name === "snapshot") {
      currentTurn = new Turn();
      currentTurn.setSnapshotEvent(event as SnapshotEvent);
      turnArray.push(currentTurn);
    }

    if (currentTurn) {
      currentTurn.addEvent(event);
    }
  }
  return turnArray;
}
