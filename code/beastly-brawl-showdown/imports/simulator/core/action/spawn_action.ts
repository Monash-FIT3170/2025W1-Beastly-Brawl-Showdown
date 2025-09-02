import { Battle } from "../battle";
import { SideId } from "../side";
import { Action } from "./action";

export interface SpawnAction extends Action<"spawnAction"> {
  do(battle: Battle, source: SideId): void;
}
