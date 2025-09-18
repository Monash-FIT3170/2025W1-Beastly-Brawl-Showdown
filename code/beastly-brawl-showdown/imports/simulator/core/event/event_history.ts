import { BaseEvent } from "./base_event";

export type OrderedEvent = BaseEvent & {
  /** The index in history this number exists as */
  index: number;
};

type EventHistoryListener = {
  onNewEvent(event: OrderedEvent): void;
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

  addEvent(event: BaseEvent) {
    const orderedEvent = { ...event, index: this.events.length };
    this.events.push(orderedEvent);
    this.emitOnNewEvent(orderedEvent);
  }

  subscribeListener(listener: EventHistoryListener) {
    this.listeners.push(listener);
  }
  unsubscribeListener(listener: EventHistoryListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emitOnNewEvent(event: OrderedEvent) {
    this.listeners.forEach((listener) => {
      listener.onNewEvent(event);
    });
  }
}
