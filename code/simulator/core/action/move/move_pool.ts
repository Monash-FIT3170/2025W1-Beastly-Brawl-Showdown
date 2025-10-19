import type { LookupTable } from "../../utils";
import type { MoveData } from "./move";

export type MoveId = Lowercase<string>;

/**
 * A move pool is a collection of moves accessible by ID
 */
export type MovePool<MOVE_NAME extends MoveId = MoveId> = Readonly<LookupTable<MOVE_NAME, "moveId", MoveData>>;
