import type { Battle } from "../battle";
import type { SideId } from "../side";
import type { Action } from "./action";

export interface SpawnAction extends Action<"spawnAction"> {
  do(battle: Battle, source: SideId): void;
}
