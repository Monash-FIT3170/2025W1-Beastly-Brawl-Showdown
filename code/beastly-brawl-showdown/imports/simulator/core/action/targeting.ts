import { SideId } from "../side";

/**
 * The following targeting methods are availible
 */
export type TargetingMethod = "self" | "single-enemy";
// export type TargetingMethod = "self" | "single-enemy" | "all-enemy" | "all";
interface BaseTargetingData<TM extends TargetingMethod> {
  targetingMethod: TM;
}
export interface SelfTargeting extends BaseTargetingData<"self"> {}
export interface SingleEnemyTargeting
  extends BaseTargetingData<"single-enemy"> {
  target: SideId;
}
// // interface AllEnemyTargeting extends BaseTargetingData<"all-enemy"> { }
// // interface AllTargeting extends BaseTargetingData<"all"> { }
export type TargetingData = SelfTargeting | SingleEnemyTargeting;
// //| AllEnemyTargeting | AllTargeting;
