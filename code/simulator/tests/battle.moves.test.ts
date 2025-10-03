import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { TargetingData } from "../core/action/targeting";
import { getComponent, getIsBlockedFromMove, getStat } from "../core/monster/monster";
import { roll as rollDice } from "../core/roll";
import { PRNG } from "../core/prng";
import { autoResolveRollsAndRerolls, makeBattle, spawnAllMonsters, targetEnemy } from "./testUtils";
import { AbilityChargeStunComponent } from "../core/monster/component/core_components";


describe("Battle.Move.perform.attack-normal", () => {
  test("battle deals damage when attack-normal is used", async () => {
    const battle = makeBattle(1456, [
      { monsterId: "shadow_fang" },
      { monsterId: "mystic_wryven" },
    ]);
    const autoResolveNotices = autoResolveRollsAndRerolls();
    battle.noticeBoard.subscribeListener(autoResolveNotices);

    try {
      spawnAllMonsters(battle);

      const attackerSide = battle.sides[0];
      const defenderSide = battle.sides[1];
      const attacker = attackerSide.id;
      const defender = defenderSide.id;
      const defenderMonster = defenderSide.monster;
      const startingHP = defenderMonster.health;

      await battle.movePool["attack-normal"].perform(battle, attacker, targetEnemy(defender));

      const attackerTemplate = COMMON_MONSTER_POOL.monsters[
        attackerSide.monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
      ];
      const defenderTemplate = COMMON_MONSTER_POOL.monsters[
        defenderMonster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
      ];

      const deterministicRng = new PRNG(1456);
      const attackRoll = rollDice(deterministicRng, 20);
      const baseDamageRoll = rollDice(deterministicRng, 4);

      expect(attackRoll).toBeGreaterThan(getStat("armour", defenderMonster, defenderTemplate));

      const attackStat = getStat("attack", attackerSide.monster, attackerTemplate);
      const baseDamage = baseDamageRoll + attackStat;
      const critChance = getStat("crit_chance", attackerSide.monster, attackerTemplate);
      const critDamage = critChance + attackRoll > 15 ? baseDamage : 0;
      const expectedDamage = baseDamage + critDamage;

      expect(defenderMonster.health).toBe(startingHP - expectedDamage);
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolveNotices);
    }
  });
});


describe("Battle.Move.perform.defend", () => {
  test("defend consumes a charge and grants temporary armour", async () => {
    const battle = makeBattle(2025, [
      { monsterId: "shadow_fang" },
      { monsterId: "mystic_wryven" },
    ]);
    const autoResolve = autoResolveRollsAndRerolls();
    battle.noticeBoard.subscribeListener(autoResolve);

    try {
      spawnAllMonsters(battle);

      const defender = battle.sides[0];
      const initialCharges = defender.monster.defendActionCharges;
      const startingHP = defender.monster.health;

      await battle.movePool["defend"].perform(battle, defender.id, {
        targetingMethod: "self",
      } as TargetingData);

      expect(defender.monster.defendActionCharges).toBe(initialCharges - 1);
      const defendComponent = defender.monster.components.find((component) => component.kind === "defend");
      expect(defendComponent).toBeDefined();

      const buffEvent = battle.eventHistory.events.find((event) => event.name === "buff");
      expect(buffEvent).toBeDefined();
      expect((buffEvent as any).target).toBe(defender.id);

      const defenderTemplate = COMMON_MONSTER_POOL.monsters[
        defender.monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
      ];
      const deterministicRng = new PRNG(2025);
      const attackRoll = rollDice(deterministicRng, 20);
      rollDice(deterministicRng, 4);
      rollDice(deterministicRng, 20);

      expect(attackRoll).toBeLessThanOrEqual(getStat("armour", defender.monster, defenderTemplate));

      await battle.movePool["attack-normal"].perform(battle, battle.sides[1].id, targetEnemy(defender.id));

      const blockedEvent = battle.eventHistory.events.find((event) => event.name === "blocked");
      expect(blockedEvent).toBeDefined();
      expect((blockedEvent as any).target).toBe(defender.id);
      expect(defender.monster.health).toBe(startingHP);
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolve);
    }
  });
});


describe("Battle.Move.perform.dodge", () => {
  test("dodge adds dodge state when charges are available", async () => {
    const battle = makeBattle(3030, [
      { monsterId: "shadow_fang" },
      { monsterId: "mystic_wryven" },
    ]);
    const autoResolve = autoResolveRollsAndRerolls();
    battle.noticeBoard.subscribeListener(autoResolve);

    try {
      spawnAllMonsters(battle);

      const dodger = battle.sides[0];
      const startingHP = dodger.monster.health;
      const existingState = getComponent(dodger.monster, "dodging");
      expect(existingState).toBeNull();

      await battle.movePool["dodge"].perform(battle, dodger.id, {
        targetingMethod: "self",
      } as TargetingData);

      const dodgeState = getComponent(dodger.monster, "dodging");
      expect(dodgeState).not.toBeNull();
      expect(battle.eventHistory.events.every((event) => event.name !== "moveFailed")).toBe(true);

      await battle.movePool["attack-normal"].perform(battle, battle.sides[1].id, targetEnemy(dodger.id));

      const evadedEvent = battle.eventHistory.events.find((event) => event.name === "evaded");
      expect(evadedEvent).toBeDefined();
      expect((evadedEvent as any).target).toBe(dodger.id);
      expect(dodger.monster.health).toBe(startingHP);
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolve);
    }
  });
});


describe("Battle.Move.perform.stun", () => {
  test("stun consumes a charge and leaves the target unable to act", async () => {
    const battle = makeBattle(5050, [
      { monsterId: "stone_hide" },
      { monsterId: "shadow_fang" },
    ]);
    const autoResolve = autoResolveRollsAndRerolls();
    battle.noticeBoard.subscribeListener(autoResolve);

    try {
      spawnAllMonsters(battle);

      const stunner = battle.sides[0];
      const target = battle.sides[1];
      stunner.monster.components.push(new AbilityChargeStunComponent(1));

      expect(getComponent(target.monster, "stunned")).toBeNull();

      await battle.movePool["stun"].perform(battle, stunner.id, {
        targetingMethod: "single-enemy",
        target: target.id,
      });

      expect(getComponent(target.monster, "stunned")).not.toBeNull();
      expect(getIsBlockedFromMove(target.monster)).toBe(true);

      const abilityCharge = getComponent(stunner.monster, "abilityChargeStun");
      expect(abilityCharge).not.toBeNull();
      expect(abilityCharge!.charges).toBe(0);

    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolve);
    }
  });
});
