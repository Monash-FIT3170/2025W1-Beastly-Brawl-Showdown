import { Battle, BattleOptions } from "@sim/core/battle";
import { CliAdapter } from "./cli_adapter";
import { COMMON_MONSTER_POOL } from "@sim/data/common/common_monster_pool";
import { COMMON_MOVE_POOL } from "@sim/data/common/common_move_pool";

const battleOptions: BattleOptions = {
  seed: 0,
  playerOptionSet: [{ monsterId: "mystic_wryven" }, { monsterId: "shadow_fang" }],
  monsterPool: COMMON_MONSTER_POOL,
  movePool: COMMON_MOVE_POOL,
};
const battle: Battle = new Battle(battleOptions);
console.log(`Battle: Run`);
battle.run();

console.log(`CLI: Listen`);
const cli: CliAdapter = new CliAdapter(battle.noticeBoard, battle.eventHistory);
cli.listen();
