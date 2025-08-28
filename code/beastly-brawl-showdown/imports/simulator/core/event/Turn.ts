import { SnapshotEvent, StartMoveEvent, BuffEvent, RollEvent, DamageEvent, BlockedEvent } from "./core_events"
import type { BaseEvent } from "./base_event"

export class Turn {
    turnEvents: BaseEvent[] = [];
    private snapshotEvent: SnapshotEvent | undefined

    //add event to the turnEvents
    public addEvent(value: BaseEvent): void {
        this.turnEvents.push(value);
    }

    // Methods for SnapshotEvent
    public getSnapshotEvent(): SnapshotEvent | undefined{
        return this.snapshotEvent
    }

    public setSnapshotEvent(value: SnapshotEvent) {
        this.snapshotEvent = value
    }

    public startMoveEventText(startMoveEvent: StartMoveEvent): String {
        return startMoveEvent.source + " uses " + startMoveEvent.moveId + "."
    }

    public buffEventText(buffEvent: BuffEvent): String {
        return buffEvent.source + " has activated " + buffEvent.name + "."
    }

    public rollEventText(rollEvent: RollEvent): String {
        return rollEvent.source + " has rolled a " + rollEvent.result + "."
    }

    public damageEventText(damageEvent: DamageEvent): String {
        return damageEvent.target + " has taken " + damageEvent.amount + " damage."
    }

    public blockEventText(blockedEvent: BlockedEvent): String {
        return blockedEvent?.source + " has blocked " + blockedEvent.target + "'s move."
    }

    public printEventString(event: BaseEvent): String {
        switch (event.name) {
            case "snapshot":
                return "Start of turn";

            case "buff": {
                const buffEvent = event as BuffEvent;
                return this.buffEventText(buffEvent);
            }

            case "startMove": {
                const startMoveEvent = event as StartMoveEvent;
                return this.startMoveEventText(startMoveEvent);
            }

            case "roll": {
                const rollEvent = event as RollEvent;
                return this.rollEventText(rollEvent);
            }

            case "blocked": {
                const blockedEvent = event as BlockedEvent;
                return this.blockEventText(blockedEvent);
            }

            case "damage": {
                const damageEvent = event as DamageEvent;
                return this.damageEventText(damageEvent);
            }

            default:
                return event.name;
        }
    }
}