import { Battle, BattleOptions } from "../core/battle";
import { MonsterPool } from "../data/monster_pool";
import type { TargetingData } from "../core/action/targeting";
import type { EntryID } from "../core/types";
import type { ChooseMove } from "../core/notice/notice";
import { MonsterTemplate } from "../core/monster/monster";
import { SpawnAction } from "../core/action/spawn_action";

// Mock the move pool with different priorities
jest.mock("../data/common_move_pool", () => {
    // Mocked move pool with different priority classes
    const commonMovePool = {
        highPriority: {
            id: "highPriority",
            name: "High Priority",
            priorityClass: 1,
            targetingMethod: "single-enemy",
            async perform(battle: any, source: number, targeting: TargetingData) {
                const enemy = (targeting as any).target;
                battle.sides[enemy].monster.health -= 25;
                battle.eventHistory.addEvent({ name: "HIGH_FIRST" } as any);
            },
        },
        lowPriority: {
            id: "lowPriority",
            name: "Low Priority",
            priorityClass: 0,
            targetingMethod: "single-enemy",
            async perform(battle: any, source: number, targeting: TargetingData) {
                const enemy = (targeting as any).target;
                battle.sides[enemy].monster.health -= 25;
                battle.eventHistory.addEvent({ name: `LOW_FROM_${source}` } as any);
            },
        },
        instaKill: {
            id: "instaKill",
            name: "InstaKill",
            priorityClass: 0,
            targetingMethod: "single-enemy",
            async perform(battle: any, source: number, targeting: TargetingData) {
                const enemy = (targeting as any).target;
                battle.sides[enemy].monster.health = 0;
            },
        },
    };
    return { commonMovePool };
});
// Helper to create targeting data for a specific enemy
function targetEnemy(sideId: number): TargetingData {
    return { targetingMethod: "single-enemy", target: sideId } as TargetingData;
}
// Helper to extract the ChooseMove notice for a specific side
function getChooseMoveNotice(battle: Battle, side: number): ChooseMove {
    const noticeMap = battle.noticeBoard.noticeMaps[side];
    const notice = noticeMap.get("chooseMove" as any);
    if (!notice) {
        throw new Error(`No "chooseMove" notice found for side ${side}`);
    }
    return notice as ChooseMove;
}
//Actual tests
describe("Battle.run", () => {
    test("battle ends immediately when instaKill is used", async () => {
        const opts: BattleOptions = {
            seed: 42,
            playerOptionSet: [
                { monsterTemplate: MonsterPool[0] },
                { monsterTemplate: MonsterPool[1] },
            ],
        };

        const battle = new Battle(opts);
        const runPromise = battle.run();
        await Promise.resolve();

        getChooseMoveNotice(battle, 0).callback("instaKill" as EntryID, targetEnemy(1));
        getChooseMoveNotice(battle, 1).callback("instaKill" as EntryID, targetEnemy(0));

        await runPromise;
        // Check that the battle ended with a snapshot and battleOver event
        const events = battle.eventHistory.events;
        expect(events.some(e => e.name === "snapshot")).toBe(true);
        expect(events[events.length - 1].name).toBe("battleOver");
    });

    test("higher priority move executes before lower priority move", async () => {
        const opts: BattleOptions = {
            seed: 77,
            playerOptionSet: [
                { monsterTemplate: MonsterPool[0] },
                { monsterTemplate: MonsterPool[1] },
            ],
        };

        const battle = new Battle(opts);
        const runPromise = battle.run();
        await Promise.resolve();

        getChooseMoveNotice(battle, 0).callback("lowPriority" as EntryID, targetEnemy(1));
        getChooseMoveNotice(battle, 1).callback("highPriority" as EntryID, targetEnemy(0));

        await runPromise;

        const eventNames = battle.eventHistory.events.map(e => e.name);
        const highIndex = eventNames.indexOf("HIGH_FIRST");

        //LOW_FROM_0 means side 0 used lowPriority move
        const lowIndex = eventNames.indexOf("LOW_FROM_0");

        // Ensure both events occurred and in the correct order
        expect(highIndex).toBeGreaterThanOrEqual(0);
        expect(lowIndex).toBeGreaterThanOrEqual(0);
        expect(highIndex).toBeLessThan(lowIndex);
    });

    test("faster monster acts before slower monster when priority is equal", async () => {

        const fastMonster: MonsterTemplate = {
            name: "FastMon",
            description: "fast boi",
            imageUrl: "",
            baseStats: { health: 7, armour: 0, attack: 1, speed: 99 },
            attackActionId: "lowPriority" as EntryID,
            defendActionId: "lowPriority" as EntryID,
            baseDefendActionCharges: 0,
            onSpawnActions: [] as SpawnAction[],
        };

        // Create a slow monster (speed 1)
        const slowMonster: MonsterTemplate = {
            name: "SlowMon",
            description: "slow boi",
            imageUrl: "",
            baseStats: { health: 7, armour: 0, attack: 1, speed: 69 },
            attackActionId: "lowPriority" as EntryID,
            defendActionId: "lowPriority" as EntryID,
            baseDefendActionCharges: 0,
            onSpawnActions: [] as SpawnAction[],
        };

        const opts: BattleOptions = {
            seed: 55,
            playerOptionSet: [
                { monsterTemplate: fastMonster },
                { monsterTemplate: slowMonster }
            ],
        };

        const battle = new Battle(opts);

        const runPromise = battle.run();
        await Promise.resolve();

        // Both monsters pick the same low-priority move
        getChooseMoveNotice(battle, 0).callback("lowPriority" as EntryID, targetEnemy(1));
        getChooseMoveNotice(battle, 1).callback("lowPriority" as EntryID, targetEnemy(0));

        await runPromise;

        const eventNames = battle.eventHistory.events.map(e => e.name).filter(name => name.startsWith("LOW_FROM_"))

        //The fast monster (side 0) should act before the slow monster (side 1)
        expect(eventNames[0]).toBe("LOW_FROM_0");
        expect(eventNames[1]).toBe("LOW_FROM_1");
    });

});
