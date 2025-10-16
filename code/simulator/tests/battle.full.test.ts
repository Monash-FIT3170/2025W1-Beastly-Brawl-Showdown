import { TargetingData } from "../core/action/targeting";
import { getComponent} from "../core/monster/monster";
import { EntryID } from "../core/utils";
import { DamageEvent, RollEvent } from "../core/event/core_events";
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

    const rngSequence = [0.9, 0.7, 0.6, 0.95, 0.8, 0.9];
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
    let initialHealthAdjusted = false;
    let dodgeChargeRemoved = false;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          if (!initialHealthAdjusted) {
            shadowFang.monster.health = 7;
            initialHealthAdjusted = true;
          } else if (!dodgeChargeRemoved && target === shadowFang.id && turnIndex >= 1) {
            shadowFang.monster.components = shadowFang.monster.components.filter(
              (component) => component.kind !== "dodgeCharges" && component.kind !== "dodging"
            );
            dodgeChargeRemoved = true;
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

describe("Battle full flow", () => {
  test("FULL battle.run 2", async () => {
    const battle = makeBattle(6666, [
      { monsterId: "mystic_wryven" },
      { monsterId: "stone_hide" },
    ]);
    spawnAllMonsters(battle);

    const mysticWryven = battle.sides[0];
    const stoneHide = battle.sides[1];
    stoneHide.monster.health = 12;

    const rngSequence = [0.05, 0.95, 0.6, 0.4, 0.2, 0.9, 0.1, 0.3];
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
        [mysticWryven.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
      },
      {
        // turn 2
        [mysticWryven.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(mysticWryven.id) },
      },
      {
        // turn 3
        [mysticWryven.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    let rerollUsed = false;
    let initialHealthAdjusted = false;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          if (!initialHealthAdjusted) {
            stoneHide.monster.health = 12;
            initialHealthAdjusted = true;
          }
          const plan = gameTurns[turnIndex];
          const action = plan[target];

          notice.callback(action.moveId, action.targeting);
          if (target === battle.sides.length - 1) {
            turnIndex++;
          }
        } else if (notice.kind === "rerollOption") {
          rerollUsed = true;
          notice.callback(true);
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

    expect(rerollUsed).toBe(true);

    const rerollEvents = battle.eventHistory.events.filter((event) => event.name === "reroll");
    expect(rerollEvents).toHaveLength(1);

    const mysticWryvenReroll = getComponent(mysticWryven.monster, "reroll");
    expect(mysticWryvenReroll).not.toBeNull();
    expect(mysticWryvenReroll!.charges).toBe(0);

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );
    expect(damageEvents).toHaveLength(2);
    expect(damageEvents.map((event) => ({ source: event.source, target: event.target, amount: event.amount }))).toEqual([
      { source: mysticWryven.id, target: stoneHide.id, amount: 10},
      { source: mysticWryven.id, target: stoneHide.id, amount: 6 },
    ]);
  });
});

describe("Battle full flow", () => {
  test("FULL battle.run 3", async () => {
    const battle = makeBattle(7777, [
      { monsterId: "knight" },
      { monsterId: "stone_hide" },
    ]);
    spawnAllMonsters(battle);

    const knight = battle.sides[0];
    const stoneHide = battle.sides[1];

    const rngSequence = [0.1, 0.95, 0.25, 0.05, 0.7];
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
        [knight.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },
        [stoneHide.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    let initialHealthAdjusted = false;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          if (!initialHealthAdjusted) {
            stoneHide.monster.health = 8;
            initialHealthAdjusted = true;
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

    const rollEvents = battle.eventHistory.events.filter(
      (event): event is RollEvent & { index: number } => event.name === "roll"
    );
    expect(rollEvents).toHaveLength(2);
    expect(rollEvents[0].result).toBe(20);
    expect(rollEvents[1].result).toBe(15);

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );
    expect(damageEvents).toHaveLength(1);
    expect(damageEvents[0].amount).toBe(8);
    expect(stoneHide.monster.health).toBeLessThanOrEqual(0);

    expect(getComponent(knight.monster, "advantage")).not.toBeNull();
  });
});

describe("Battle full flow", () => {
  test("FULL battle.run 4", async () => {
    const battle = makeBattle(7777, [
      { monsterId: "sea_urchin" },
      { monsterId: "mystic_wryven" },
    ]);
    spawnAllMonsters(battle);
    const seaUrchin = battle.sides[0];
    const mysticWryven = battle.sides[1];

    expect(getComponent(seaUrchin.monster, "thorns")).not.toBeNull();

    const rngSequence = [0.95, 0.99, 0.6, 0.8, 0.4, 0.2];
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
        [seaUrchin.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [mysticWryven.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(seaUrchin.id) },
      },
      {
        // turn 2
        [seaUrchin.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
        [mysticWryven.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(seaUrchin.id) },
      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    let initialHealthAdjusted = false;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          if (!initialHealthAdjusted) {
            seaUrchin.monster.health = 16;
            initialHealthAdjusted = true;
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

    const moveFailedEvents = battle.eventHistory.events.filter((event) => event.name === "moveFailed");
    expect(moveFailedEvents).toHaveLength(0);

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );
    expect(damageEvents).toHaveLength(2);
    expect(damageEvents.map((event) => ({ source: event.source, target: event.target, amount: event.amount }))).toEqual([
      { source: mysticWryven.id, target: seaUrchin.id, amount: 12 },
      { source: mysticWryven.id, target: seaUrchin.id, amount: 8 },
    ]);

    expect(mysticWryven.monster.health).toBe(48);
    expect(seaUrchin.monster.health).toBeLessThanOrEqual(0);
  });
});

describe("Battle full flow", () => {
  test("FULL battle.run 5", async () => {
    const battle = makeBattle(6969, [
      { monsterId: "stone_hide" },
      { monsterId: "shadow_fang" },
    ]);
    spawnAllMonsters(battle);
    const stoneHide = battle.sides[0];
    const shadowFang = battle.sides[1];

    const rngSequence = [0.9, 0.7, 0.6, 0.95, 0.8, 0.9];
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
        [stoneHide.id]: { moveId: "stun" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(stoneHide.id) },
      },
      {
        // turn 2
        [stoneHide.id]: { moveId: "stun" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
      },
      {
        // turn 3
        [stoneHide.id]: { moveId: "attack-normal" as EntryID, targeting: targetEnemy(shadowFang.id) },
        [shadowFang.id]: { moveId: "defend" as EntryID, targeting: { targetingMethod: "self" } as TargetingData },
      },
    ];

    const autoResolve = autoResolveRollsAndRerolls();
    let turnIndex = 0;
    let initialHealthAdjusted = false;
    const scriptedListener = {
      onPostNotice: (target: number, notice: any) => {
        if (notice.kind === "chooseMove") {
          if (turnIndex >= gameTurns.length) {
            throw new Error(`No turn for index ${turnIndex}`);
          }
          if (!initialHealthAdjusted) {
            shadowFang.monster.health = 8;
            initialHealthAdjusted = true;
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
  
    const abilityCharge = getComponent(stoneHide.monster, "abilityChargeStun");
    expect(abilityCharge).not.toBeNull();
    expect(abilityCharge!.charges).toBe(0);

    const failedEvents = battle.eventHistory.events.filter((event) => event.name === "moveFailed");
    expect(failedEvents).toHaveLength(1);
    

    const damageEvents = battle.eventHistory.events.filter(
      (event): event is DamageEvent & { index: number } => event.name === "damage"
    );
    expect(damageEvents).toHaveLength(1);
    expect(damageEvents.map((event) => ({ source: event.source, target: event.target, amount: event.amount }))).toEqual([
      { source: stoneHide.id, target: shadowFang.id, amount: 8 },
    ]);

    expect(shadowFang.monster.health).toBeLessThanOrEqual(0);
    expect(stoneHide.monster.health).toBe(60);
  });
});