import { Battle } from "../../battle";
import { SideId } from "../../side";
import { MonsterStatType } from "../monster_stats";

/**
 * A component that can be attached to a monster.
 *
 * - Components can be thought of as a "token" or a "charge" which can  be applied to a monster.
 * - It experiences events which can be used for effects such as being tunr-duration limited.
 * - Components are also consulted for stat modifiers and other checks.
 */
export interface BaseComponent<TKind extends string = string> {
  readonly kind: TKind;

  getStatBonus?: (statType: MonsterStatType) => number | null;
  getIsBlockedFromMove?: () => boolean;

  onStartTurn?(battle: Battle, selfSide: SideId): void;
  onEndTurn?(battle: Battle, selfSide: SideId): void;
}
