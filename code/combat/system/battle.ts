import { Namespace, Server, Socket } from "socket.io";
import { Side } from "./side";

export type BattleId = number & { __brand: "BattleId" };
export function asBattleId(value: number): BattleId {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid BattleId: ${value}`);
  }
  return value as BattleId;
}

export type Battle = {
  battleId: BattleId;
  sides: Side[];
};
