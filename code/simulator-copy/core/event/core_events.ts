import { Side, SideId } from "../side";
import { EntryID } from "../utils";
import { BaseEvent } from "./base_event";

export interface BattleOverEvent extends BaseEvent{
  name: "battleOver";
}

export interface SnapshotEvent extends BaseEvent {
  name: "snapshot";
  sides: Side[];
}

export interface RollEvent extends BaseEvent {
  name: "roll";
  source: SideId;
  faces: number;
  result: number;
}
export interface RerollEvent extends BaseEvent {
  name: "reroll";
  source: SideId;
  faces: number;
  result: number;
}

export interface BlockedEvent extends BaseEvent {
  name: "blocked";
  source: SideId;
  target: SideId;
}

export interface DamageEvent extends BaseEvent {
  name: "damage";
  source: SideId;
  target: SideId;
  amount: number;
}

export interface StartMoveEvent extends BaseEvent {
  name: "startMove";
  source: SideId;
  target: SideId;
  moveId: EntryID;
}

export interface MoveSuccessEvent extends BaseEvent {
  name: "moveSuccess";
  source: SideId;
  target: SideId;
  moveId: EntryID;
}

export interface MoveEvadedEvent extends BaseEvent {
  name: "evaded";
  source: SideId;
  target: SideId;
  moveId: EntryID;
}
export interface MoveFailedEvent extends BaseEvent {
  name: "moveFailed";
  source: SideId;
  target: SideId;
  moveId: EntryID;
  reason: unknown; // TODO
}
export interface BuffEvent extends BaseEvent {
  name: "buff";
  source: SideId;
  target: SideId;
  buffs: { armour: number; };
}
