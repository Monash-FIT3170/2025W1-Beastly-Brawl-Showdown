import { BaseEvent } from "./base_event";

export type OrderedEvent = BaseEvent & {
  /** The index in history this number exists as */
  index: number;
};

/** Special event type for surrender */
export type SurrenderEvent = BaseEvent & {
  name: "surrender";
  playerId: string;
};

type EventHistoryListener = {
  onNewEvent(event: OrderedEvent | SurrenderEvent): void;
};

export class EventHistory {
  /**
   * Do not modify this directly
   */
  readonly events: OrderedEvent[];
  listeners: EventHistoryListener[];

  constructor() {
    this.events = [];
    this.listeners = [];
  }

  /** Add a regular event */
  addEvent(event: BaseEvent) {
    const orderedEvent: OrderedEvent = { ...event, index: this.events.length };
    this.events.push(orderedEvent);
    this.emitOnNewEvent(orderedEvent);
  }

  /** Add a surrender event */
  addSurrenderEvent(playerId: string) {
    const surrenderEvent: SurrenderEvent = {
      name: "surrender",
      playerId,
    };
    // Add to events array as ordered event as well
    const orderedEvent: OrderedEvent = { ...surrenderEvent, index: this.events.length };
    this.events.push(orderedEvent);
    this.emitOnNewEvent(surrenderEvent);
  }

  subscribeListener(listener: EventHistoryListener) {
    this.listeners.push(listener);
  }

  unsubscribeListener(listener: EventHistoryListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emitOnNewEvent(event: OrderedEvent | SurrenderEvent) {
    this.listeners.forEach((listener) => {
      listener.onNewEvent(event);
    });
  }
}
