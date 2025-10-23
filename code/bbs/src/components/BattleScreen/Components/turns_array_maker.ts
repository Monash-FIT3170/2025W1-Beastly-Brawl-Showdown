import type { BaseEvent } from "../../../../../simulator/core/event/base_event";
import type { SnapshotEvent } from "../../../../../simulator/core/event/core_events";
import { Turn } from "./turn";

export function parseTurns(events: BaseEvent[]): Turn[] {
  const turnArray: Turn[] = [];
  let currentTurn: Turn | null = null;

  for (const event of events) {
    if (event.name === "snapshot") {
      // Create a new turn with this snapshot
      currentTurn = new Turn();
      currentTurn.setSnapshotEvent(event as SnapshotEvent);
      currentTurn.addEvent(event); // Add snapshot to events array
      turnArray.push(currentTurn);
    } else if (currentTurn) {
      // Only add non-snapshot events to the current turn
      currentTurn.addEvent(event);
    }
  }

  return turnArray;
}