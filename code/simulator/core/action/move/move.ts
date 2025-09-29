import { Battle } from "../../battle";
import { SideId } from "../../side";
import { EntryID } from "../../utils";
import { Action } from "../action";
import { TargetingData, TargetingMethod } from "../targeting";
import { MoveId } from "./move_pool";

interface MoveEvents {
  perform(battle: Battle, source: SideId, targetingData: TargetingData): Promise<void>;

  onHit?(battle: Battle, source: SideId, reciever: SideId): Promise<void>;
  onFail(battle: Battle, source: SideId): Promise<void>;
}

/**
 * A move is a specific type of action
 */
export interface MoveData
  extends Action<"move">,
    Readonly<{
      moveId: MoveId;

      name: string;
      description: string;
      icon?: string;
      priorityClass: number;
      targetingMethod: TargetingMethod;
    }>,
    MoveEvents {}

export type MoveRequest = { moveId: EntryID; source: SideId; targetingData: TargetingData };
