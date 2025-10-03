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

export function spawnMonster(battle: Battle, sideId: SideId): void {
  const side = battle.sides[sideId];
  const monster = side.monster;
  const template = battle.monsterPool.monsters[monster.baseID];
  if (!template) {
    throw new RangeError(`Monster template ${monster.baseID} missing in pool ${battle.monsterPool.name}`);
  }

  monster.health = template.baseStats.health;
  monster.defendActionCharges = template.baseDefendActionCharges;
  monster.components = [];

  template.onSpawnActions.forEach((action) => action.do(battle, sideId));
}

export function spawnAllMonsters(battle: Battle): void {
  battle.sides.forEach((side) => spawnMonster(battle, side.id));
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
