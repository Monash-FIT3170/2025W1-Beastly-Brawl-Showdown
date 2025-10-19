import type { MoveRequest } from "./action/move/move";
import type { Monster } from "./monster/monster";

export type SideId = number & { __brand: "SideId" };
export type Side = {
  id: SideId;

  monster: Monster;

  pendingActions: MoveRequest[] | null;
};
