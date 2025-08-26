import { Battle } from "../../battle";
import { SideId } from "../../side";
import { MonsterStatType } from "../monster_stats";

export interface BaseComponent<TKind extends string = string> {
  readonly kind: TKind;

  getStatBonus?: (statType: MonsterStatType) => number | null;
  getIsBlockedFromMove?: () => boolean;

  onStartTurn?(battle: Battle, selfSide: SideId): void;
  onEndTurn?(battle: Battle, selfSide: SideId): void;
}
