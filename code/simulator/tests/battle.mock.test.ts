import { Battle, BattleOptions } from "../core/battle";
import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { COMMON_MOVE_POOL } from "../data/common/common_move_pool";
import { ChooseMove } from "../core/notice/notice";
import { EntryID } from "../core/utils";
import { TargetingData } from "../core/action/targeting";
import { SideId } from "../core/side";
jest.mock("../data/common/common_move_pool", () => {
    const COMMON_MOVE_POOL = {
    instaKill: {
      moveId: "instaKill",
      name: "InstaKill",
      priorityClass: 0,
      targetingMethod: "single-enemy",
      async perform(battle: any, source: number, targeting: TargetingData) {
        const enemy = (targeting as any).target;
        battle.sides[enemy].monster.health = 0;
      },
    },
  };
  return { COMMON_MOVE_POOL };
});
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
describe("Battle.run.mocked_attack", () => {
    test("battle ends immediately when instaKill is used", async () => {
    const opts: BattleOptions = {
      seed: 123,
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

        getChooseMoveNotice(battle, 0).callback("instaKill" as EntryID, targetEnemy(1));
        getChooseMoveNotice(battle, 1).callback("instaKill" as EntryID, targetEnemy(0));

        await runPromise;
        
        const events = battle.eventHistory.events;
        expect(events.some(e => e.name === "snapshot")).toBe(true);
        expect(events[events.length - 1].name).toBe("battleOver");
    });
});