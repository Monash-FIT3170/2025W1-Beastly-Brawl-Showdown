import type { Battle } from "../../battle";
import type { StartMoveEvent, MoveEvadedEvent, RollEvent, RerollEvent, BlockedEvent, MoveSuccessEvent, DamageEvent } from "../../event/core_events";
import type { DodgeStateComponent, RerollChargeComponent, NextAttacksBonusComponent } from "../../monster/component/core_components";
import type { Monster } from "../../monster/monster";
import { getComponent, getStat, removeComponent } from "../../monster/monster";
import { roll } from "../../roll";
import type { SideId } from "../../side";
import type { MoveData } from "./move";

// Helper function to handle advantage rolls
function rollWithAdvantage(monster: Monster, rng: Battle["rng"], faces: number): number {
  const hasAdvantage = !!getComponent(monster, "advantage");
  if (!hasAdvantage) return roll(rng, faces);

  const firstRoll = roll(rng, faces);
  const secondRoll = roll(rng, faces);
  return Math.max(firstRoll, secondRoll);
}

export async function default_attack(parentMove: MoveData, battle: Battle, source: SideId, target: SideId) {
  const sourceMonster: Monster = battle.sides[source].monster;
  const targetMonster: Monster = battle.sides[target].monster;

  //# Start move
  const startMoveEvent: StartMoveEvent = {
    name: "startMove",
    source: source,
    target: target,
    moveId: parentMove.moveId,
    attackChargesConsumed: 1,
  };
  battle.eventHistory.addEvent(startMoveEvent);

  //# Evade check
  const dodgeState: DodgeStateComponent | null = getComponent(targetMonster, "dodging");
  if (dodgeState) {
    const moveEvadedEvent: MoveEvadedEvent = {
      name: "evaded",
      source: source,
      target: target,
      moveId: parentMove.moveId,
    };
    battle.eventHistory.addEvent(moveEvadedEvent);
    return;
  }

  //# Roll
  await new Promise<void>((resolve) => {
    battle.noticeBoard.postNotice(source, {
      kind: "roll",
      data: { diceFaces: 20 },
      callback: function (): void {
        battle.noticeBoard.removeNotice(source, "roll");
        resolve();
      },
    });
  });
  let rollResult: number = rollWithAdvantage(sourceMonster, battle.rng, 20);
  const rollEvent: RollEvent = {
    name: "roll",
    source: source,
    faces: 20,
    result: rollResult,
  };
  battle.eventHistory.addEvent(rollEvent);

  // # Reroll
  const rerollComponent: RerollChargeComponent | null = getComponent(sourceMonster, "reroll");
  if (rerollComponent && rerollComponent.charges > 0) {
    await new Promise<void>((resolve) => {
      battle.noticeBoard.postNotice(source, {
        kind: "rerollOption",
        data: { diceFaces: 20 },
        callback: function (shouldReroll: boolean): void {
          if (shouldReroll) {
            rerollComponent.charges--;
            rollResult = roll(battle.rng, 20);
            const rerollEvent: RerollEvent = {
              name: "reroll",
              source: source,
              faces: 20,
              result: rollResult,
            };
            battle.eventHistory.addEvent(rerollEvent);
          }
          battle.noticeBoard.removeNotice(source, "rerollOption");
          resolve();
        },
      });
    });
  }

  //# Armour Check
  if (rollResult <= getStat("armour", targetMonster, battle.monsterPool.monsters[targetMonster.baseID])) {
    const blockedEvent: BlockedEvent = {
      name: "blocked",
      source: source,
      target: target,
    };
    battle.eventHistory.addEvent(blockedEvent);
    return;
  }

  const moveSuccessEvent: MoveSuccessEvent = {
    name: "moveSuccess",
    source: source,
    target: target,
    moveId: parentMove.moveId,
  };
  battle.eventHistory.addEvent(moveSuccessEvent);

  //# Base damage roll
  let baseDamage: number = roll(battle.rng, 4) + getStat("attack", sourceMonster, battle.monsterPool.monsters[sourceMonster.baseID]);

  // Check for next-attacks bonus
  const bonusComponent = getComponent(sourceMonster, "nextAttacksBonus") as NextAttacksBonusComponent | null;
  if (bonusComponent && bonusComponent.remainingAttacks > 0) {
    baseDamage += bonusComponent.bonusDamage; // add +3 damage
    bonusComponent.remainingAttacks--;

    if (bonusComponent.remainingAttacks === 0) {
      removeComponent(sourceMonster, bonusComponent); // remove component when used up
    }
  }

  //# Crit Check
  const critChanceBonus: number = getStat("crit_chance", sourceMonster, battle.monsterPool.monsters[sourceMonster.baseID]);
  const critRollResult: number = rollWithAdvantage(sourceMonster, battle.rng, 20);
  const critRollEvent: RollEvent = {
    name: "roll",
    source: source,
    faces: 20,
    result: critRollResult,
  };
  battle.eventHistory.addEvent(critRollEvent);
  //TODO -> change threshold (15) to something based on action / monster
  const critDamage: number = critChanceBonus + rollResult > 15 ? baseDamage : 0;

  //# Apply base damage and crit
  let damageToTake: number = baseDamage + critDamage;

  //# Check for Damage Reduction passive
  const dmgReduction = getComponent(targetMonster, "damageReduction");
  if (dmgReduction) {
    damageToTake -= dmgReduction.reductionAmount;
    if (damageToTake < 0) damageToTake = 0; // prevent negative damage
  }

  targetMonster.health -= damageToTake;
  const damageEvent: DamageEvent = {
    name: "damage",
    source: source,
    target: target,
    amount: damageToTake,
  };
  battle.eventHistory.addEvent(damageEvent);

  //# Trigger Thorns
  const thornsComponent = getComponent(targetMonster, "thorns");
  if (thornsComponent) {
    thornsComponent.onHit(battle, target, source);
  }
}
