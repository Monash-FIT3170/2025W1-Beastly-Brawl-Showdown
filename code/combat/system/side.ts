import { Player } from "../../game-server/user";
import { Monster } from "./monster";

export type SideId = number & { __brand: "SideId" };
export function asSideId(value: number): SideId {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid SideId: ${value}`);
  }
  return value as SideId;
}

export type Side = {
  id: SideId;
  controllingPlayer: Player;
  monster: Monster;
  pendingMoveId: "attack" | "defend" | "ability" | null; // The ID of the move that is pending execution
};

