import { TargetingData } from "../core/action/targeting";
import { SideId } from "../core/side";
import { Notice } from "../core/notice/notice";
import { BattleOptions, Battle, PlayerOptions } from "../core/battle";
import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { COMMON_MOVE_POOL } from "../data/common/common_move_pool";

export function targetEnemy(side: number): TargetingData {
  return { targetingMethod: "single-enemy", target: side as SideId };
}

export function makeBattle(seed: number, playerOptions: PlayerOptions[]): Battle {
  const opts: BattleOptions = {
    seed,
    monsterPool: COMMON_MONSTER_POOL,
    movePool: COMMON_MOVE_POOL,
    playerOptionSet: playerOptions,
  };
  return new Battle(opts);
}

export function autoResolveRollsAndRerolls() {
  return {
    onPostNotice: (_target: number, notice: Notice) => {
      if (notice.kind === "roll") {
        notice.callback();
      } else if (notice.kind === "rerollOption") {
        notice.callback(false);
      }
    },
    onRemoveNotice: () => {},
  };
}
