import { Battle, BattleOptions } from "../core/battle";
import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { COMMON_MOVE_POOL } from "../data/common/common_move_pool";
import { ChooseMove } from "../core/notice/notice";
import { EntryID } from "../core/utils";
import { TargetingData } from "../core/action/targeting";
import { SideId } from "../core/side";
function targetEnemy(side: number): TargetingData {
  return { targetingMethod: "single-enemy", target: side as SideId };
}

function getChooseMoveNotice(battle: Battle, side: number): ChooseMove {
    const noticeMap = battle.noticeBoard.noticeMaps[side];
    const notice = noticeMap.get("chooseMove" as any);
    if (!notice) {
        throw new Error(`No "chooseMove" notice found for side ${side}`);
    }
    return notice as ChooseMove;
}
describe("Battle.run.real_attack", () => {
  test("battle deals damage when attack-normal is used", async () => {
    const opts: BattleOptions = {
      seed: 42,
      monsterPool: COMMON_MONSTER_POOL,
      movePool: COMMON_MOVE_POOL,
      playerOptionSet: [
        { monsterId: "mystic_wryven" },
        { monsterId: "shadow_fang" },
      ],
    };

    const battle = new Battle(opts);
    const runPromise = battle.run();
    
    await Promise.resolve();
    battle.sides[1].monster.health = 1;
    console.log("HEALTH SET (1): " + battle.sides[1].monster.health);   
    getChooseMoveNotice(battle, 0).callback("attack-normal" as EntryID, targetEnemy(1));
    getChooseMoveNotice(battle, 1).callback("attack-normal" as EntryID, targetEnemy(0));
    await new Promise(r => setTimeout(r, 50));
    console.log("HEALTH AFTER ATTACK (1): " + battle.sides[1].monster.health);  

    await runPromise;

    const p0HP = battle.sides[0].monster.health;
    const p1HP = battle.sides[1].monster.health;

    expect(p0HP).toBeLessThan(25);
    //expect(p1HP).toBeLessThan(20);
    const events = battle.eventHistory.events;
    expect(events.some(e => e.name === "snapshot")).toBe(true);
  });
});
