import { TargetingData } from "../core/action/targeting";
import { getComponent} from "../core/monster/monster";
import { EntryID } from "../core/utils";
import { DamageEvent } from "../core/event/core_events";
import { autoResolveRollsAndRerolls, makeBattle, spawnAllMonsters, targetEnemy } from "./testUtils";

describe("Battle full flow", () => {
  test("FULL battle.run 1", async () => {
    const battle = makeBattle(9999, [
      { monsterId: "stone_hide" },
      { monsterId: "shadow_fang" },
    ]);
    spawnAllMonsters(battle);

    const stoneHide = battle.sides[0];
    const shadowFang = battle.sides[1];

    const rngSequence = [0.0, 0.6, 0.5, 0.0, 0.95, 0.75, 0.0];
    let rngIndex = 0;
    const originalNext = battle.rng.next;

    battle.rng.next = () => {
      if (rngIndex < rngSequence.length) {
        const value = rngSequence[rngIndex];
        rngIndex++;
        return value;
      } else {
        return originalNext.call(battle.rng);
      }
    };


    const gameTurns: Array<Record<number, { moveId: EntryID; targeting: TargetingData }>> = [
      {
        // turn 1
        [shadowFang.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },

      },
      {
        // turn 2
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "dodge" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },

      },
      {
        // turn 3
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },

      },
      {
        // turn 4
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [shadowFang.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },

      },
      {
        // turn 5
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [shadowFang.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },

      },
      {
        // turn 6
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [shadowFang.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },

      },
      {
        // turn 7
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },

      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          const plan = gameTurns[turnIndex];
          const action = plan[target];

          notice.callback(action.moveId, action.targeting);
          if (target === battle.sides.length - 1) {
            turnIndex++;
          }
        } else {
          autoResolve.onPostNotice(target, notice);
        }
      },
      onRemoveNotice: autoResolve.onRemoveNotice,
    };

    battle.noticeBoard.subscribeListener(scriptedListener);

    try {
      await battle.run();
    } finally {
      battle.noticeBoard.unsubscribeListener(scriptedListener);
      battle.rng.next = originalNext;
    }

    
    expect(shadowFang.monster.health).toBeLessThanOrEqual(0);
    expect(stoneHide.monster.health).toBe(30);
    expect(getComponent(stoneHide.monster, "defend")).toBeNull();

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );

    expect(damageEvents.map((event) => ({ source: event.source, target: event.target, amount: event.amount }))).toEqual([
      { source: stoneHide.id, target: shadowFang.id, amount: 4 },
      { source: stoneHide.id, target: shadowFang.id, amount: 10 },
      { source: stoneHide.id, target: shadowFang.id, amount: 6 },
    ]);

    const eventNames = battle.eventHistory.events.map((event) => event.name);
    expect(eventNames).toContain("evaded");
    const evadedEvents = battle.eventHistory.events.filter((event) => event.name === "evaded");
    expect(evadedEvents).toHaveLength(1);
    expect(eventNames).toContain("blocked");
    
  });
});


describe("Battle full flow", () => {
  test("FULL battle.run 2", async () => {
    const battle = makeBattle(9999, [
      { monsterId: "stone_hide" },
      { monsterId: "shadow_fang" },
    ]);
    spawnAllMonsters(battle);

    const stoneHide = battle.sides[0];
    const shadowFang = battle.sides[1];
    shadowFang.monster.health = 7;

    const rngSequence = [0.9,0.7,0.6];
    let rngIndex = 0;
    const originalNext = battle.rng.next;

    battle.rng.next = () => {
      if (rngIndex < rngSequence.length) {
        const value = rngSequence[rngIndex];
        rngIndex++;
        return value;
      } else {
        return originalNext.call(battle.rng);
      }
    };

    const gameTurns: Array<Record<number, { moveId: EntryID; targeting: TargetingData }>> = [
      {
        // turn 1
        [shadowFang.id]: { moveId: "dodge" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
      },
      {
        // turn 2
        [shadowFang.id]: { moveId: "dodge" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
      },
      {
        // turn 3
        [shadowFang.id]: { moveId: "dodge" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          const plan = gameTurns[turnIndex];
          const action = plan[target];

          notice.callback(action.moveId, action.targeting);
          if (target === battle.sides.length - 1) {
            turnIndex++;
          }
        } else {
          autoResolve.onPostNotice(target, notice);
        }
      },
      onRemoveNotice: autoResolve.onRemoveNotice,
    };

    battle.noticeBoard.subscribeListener(scriptedListener);

    try {
      await battle.run();
    } finally {
      battle.noticeBoard.unsubscribeListener(scriptedListener);
      battle.rng.next = originalNext;
    }

    const evadedEvents = battle.eventHistory.events.filter((event) => event.name === "evaded");
    expect(evadedEvents).toHaveLength(1);

    const failedEvents = battle.eventHistory.events.filter((event) => event.name === "moveFailed");
    expect(failedEvents).toHaveLength(2);

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );

    expect(damageEvents).toHaveLength(1);
    expect(damageEvents.map((event) => ({ source: event.source, target: event.target, amount: event.amount }))).toEqual([
      { source: stoneHide.id, target: shadowFang.id, amount: 8 },
    ]);

    expect(shadowFang.monster.health).toBeLessThanOrEqual(0);
    expect(getComponent(shadowFang.monster, "dodging")).toBeNull();
  });
});
