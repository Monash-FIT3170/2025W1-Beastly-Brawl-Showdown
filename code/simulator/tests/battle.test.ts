import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { EntryID } from "../core/utils";
import { TargetingData } from "../core/action/targeting";
import { spawnMonster, getStat } from "../core/monster/monster";
import { Notice } from "../core/notice/notice";
import { roll as rollDice } from "../core/roll";
import { PRNG } from "../core/prng";
import { StartMoveEvent } from "../core/event/core_events";
import { autoResolveRollsAndRerolls, makeBattle, targetEnemy } from "./testUtils";

describe("Battle.run.real_attack", () => {
  test("battle deals damage when attack-normal is used", async () => {
    const battle = makeBattle(1456);
    const autoResolveNotices = autoResolveRollsAndRerolls();
    battle.noticeBoard.subscribeListener(autoResolveNotices);

    try {
      battle.sides.forEach((side) => {
        spawnMonster(battle, side.id, battle.monsterPool);
        side.monster.defendCharges = 0;
      });

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
      rollDice(deterministicRng, 20);

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

describe("Battle order", () => {
  test("faster monster acts before slower monster when priority is equal", async () => {
    const battle = makeBattle(77);
    const autoResolve = autoResolveRollsAndRerolls();
    const autoResolveNotices = {
      onPostNotice: (target: number, notice: Notice) => {
        if (notice.kind === "chooseMove") {
          const enemySide = target === 0 ? 1 : 0;
          notice.callback("attack-normal" as EntryID, targetEnemy(enemySide));
        } else {
          autoResolve.onPostNotice(target, notice);
        }
      },
      onRemoveNotice: autoResolve.onRemoveNotice,
    };
    battle.noticeBoard.subscribeListener(autoResolveNotices);

    try {
      await battle.run();
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolveNotices);
    }

    const startMoveEvents = battle.eventHistory.events.filter(
      (event): event is StartMoveEvent & { index: number } => {
        return event.name === "startMove";
      }
    );

    expect(startMoveEvents.length).toBeGreaterThanOrEqual(2);
    expect(startMoveEvents[0].source).toBe(battle.sides[0].id);
    expect(startMoveEvents[1].source).toBe(battle.sides[1].id);
  });
});

describe("Move availability", () => {
  test("monster without attack charges cannot select attack", async () => {
    const battle = makeBattle(88);
    const attackMoveId = COMMON_MONSTER_POOL.monsters.shadow_fang.attackActionId;
    const recordedOptions: EntryID[][] = [];
    const autoResolve = autoResolveRollsAndRerolls();
    const autoResolveNotices = {
      onPostNotice: (target: number, notice: Notice) => {
        if (notice.kind === "chooseMove") {
          if (target === battle.sides[0].id) {
            recordedOptions.push([...notice.data.moveIdOptions]);
            const turnIndex = recordedOptions.length;

            if (turnIndex <= 3 && notice.data.moveIdOptions.includes(attackMoveId)) {
              notice.callback(attackMoveId, targetEnemy(battle.sides[1].id));
            } else {
              notice.callback("defend" as EntryID, { targetingMethod: "self" } as TargetingData);
              battle.sides.forEach((side) => {
                side.monster.health = 0;
              });
            }
          } else {
            notice.callback("defend" as EntryID, { targetingMethod: "self" } as TargetingData);
          }
        } else {
          autoResolve.onPostNotice(target, notice);
        }
      },
      onRemoveNotice: autoResolve.onRemoveNotice,
    };
    battle.noticeBoard.subscribeListener(autoResolveNotices);

    try {
      await battle.run();
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolveNotices);
    }

    expect(recordedOptions.length).toBeGreaterThanOrEqual(4);
    expect(recordedOptions[0]).toContain(attackMoveId);
    expect(recordedOptions[1]).toContain(attackMoveId);
    expect(recordedOptions[2]).toContain(attackMoveId);
    expect(recordedOptions[3]).not.toContain(attackMoveId);
  });
});
