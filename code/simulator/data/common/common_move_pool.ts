import { MoveData } from "@beastly-brawl-showdown/sim-core/action/move/move";
import { MovePool } from "@beastly-brawl-showdown/sim-core/action/move/move_pool";
import { default_attack } from "@beastly-brawl-showdown/sim-core/action/move/move_utils";
import { SelfTargeting, SingleEnemyTargeting, TargetingData } from "@beastly-brawl-showdown/sim-core/action/targeting";
import { Battle } from "@beastly-brawl-showdown/sim-core/battle";
import { BlockedEvent, BuffEvent, DamageEvent, MoveEvadedEvent, MoveFailedEvent, MoveSuccessEvent, RerollEvent, RollEvent, StartMoveEvent } from "@beastly-brawl-showdown/sim-core/event/core_events";
import { AbilityChargeStunComponent, DefendComponent, DodgeChargeComponent, DodgeStateComponent, RerollChargeComponent, StunnedStateComponent } from "@beastly-brawl-showdown/sim-core/monster/component/core_components";
import { getComponent, getStat, Monster } from "@beastly-brawl-showdown/sim-core/monster/monster";
import { SideId } from "@beastly-brawl-showdown/sim-core/side";

export type COMMON_MOVE_NAMES = "nothing" | "attack-normal" | "defend" | "dodge" | "stun";
export const COMMON_MOVE_POOL: MovePool<COMMON_MOVE_NAMES> = {
  nothing: {
    moveId: "nothing",
    type: "move",
    name: "Do nothing",
    description: "Do nothing...",
    priorityClass: 0,
    targetingMethod: "self",

    perform: async function (battle: Battle, source: SideId, targetingData: TargetingData) {
      throw new Error("This action should not be used EVER.");
    },
    onFail: async function (battle: Battle, source: SideId): Promise<void> {},
  },

  "attack-normal": {
    moveId: "attack-normal",
    type: "move",

    name: "Attack",
    description: "A regular attack.",
    icon: "wolverine-claws.svg",

    priorityClass: 0,
    targetingMethod: "single-enemy",

    perform: async function (battle: Battle, source: SideId, targetingData: SingleEnemyTargeting) {
      const target: SideId = targetingData.target;

      default_attack(this, battle, source, target);
    },
    onHit: async function (battle: Battle, source: SideId, target: SideId): Promise<void> {
      // TODO
    },
    onFail: async function (battle: Battle, source: SideId): Promise<void> {},
  },

  defend: {
    moveId: "defend",
    type: "move",
    name: "Defend",
    description: "Increase your armor class temporarily.",
    icon: "vibrating-shield.svg",
    priorityClass: 5,
    targetingMethod: "self",

    async perform(battle: Battle, source: SideId): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;

      if (sourceMonster.defendActionCharges <= 0) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source: source,
          target: source,
          moveId: this.moveId,
          reason: null,
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }
      sourceMonster.defendActionCharges -= 1;

      const defenseComponent: DefendComponent = new DefendComponent(1, 2);
      sourceMonster.components.push(defenseComponent);
      const buffEvent: BuffEvent = {
        name: "buff",
        source: source,
        target: source,
        buffs: { armour: defenseComponent.bonusArmour },
      };
      battle.eventHistory.addEvent(buffEvent);
    },
    onFail: function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },

  dodge: {
    moveId: "dodge",
    type: "move",
    name: "Dodge",
    description: "Dodge an attack, avoid it completely.",
    priorityClass: 5,
    targetingMethod: "self",
    async perform(battle: Battle, source: SideId, targetingData: SelfTargeting): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;

      const dodgeChargeComponent: DodgeChargeComponent | null = getComponent(sourceMonster, "dodgeCharges");
      if (!dodgeChargeComponent) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source: source,
          target: source,
          moveId: this.moveId,
          reason: undefined,
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      const dodgeComponent: DodgeStateComponent | null = getComponent(sourceMonster, "dodging");
      if (!dodgeComponent) {
        sourceMonster.components.push(new DodgeStateComponent(1));
      } else {
        dodgeComponent.remainingDuration++;
      }
    },
    onFail: function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },

  stun: {
    moveId: "stun",
    type: "move",
    name: "Stun",
    description: "Stun the monster, preventing it from taking actions for one turn.",
    priorityClass: 3,
    targetingMethod: "single-enemy",
    async perform(battle: Battle, source: SideId, targetingData: SingleEnemyTargeting): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;
      const target: SideId = targetingData.target;
      const targetMonster: Monster = battle.sides[target].monster;

      const abilityChargeStunComponent: AbilityChargeStunComponent | null = getComponent(sourceMonster, "abilityChargeStun");
      if (!abilityChargeStunComponent) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source: source,
          target: source,
          moveId: this.moveId,
          reason: undefined,
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      const stunnedComponent: StunnedStateComponent | null = getComponent(targetMonster, "stunned");
      if (!stunnedComponent) {
        sourceMonster.components.push(new StunnedStateComponent(1));
      } else {
        stunnedComponent.remainingDuration++;
      }
    },
    onFail: async function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },
};
