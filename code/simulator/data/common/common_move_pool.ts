import { MovePool } from "../../core/action/move/move_pool";
import { default_attack } from "../../core/action/move/move_utils";
import {
  SelfTargeting,
  SingleEnemyTargeting,
  TargetingData,
} from "../../core/action/targeting";
import { Battle } from "../../core/battle";
import { BuffEvent, MoveFailedEvent } from "../../core/event/core_events";
import {
  AbilityChargeStunComponent,
  DefendComponent,
  DodgeChargeComponent,
  DodgeStateComponent,
  NextAttacksBonusComponent,
  PermanentStatBuffComponent,
  StunnedStateComponent,
} from "../../core/monster/component/core_components";
import { getComponent, Monster } from "../../core/monster/monster";
import { SideId } from "../../core/side";

export type COMMON_MOVE_NAMES =
  | "nothing"
  | "attack-normal"
  | "defend"
  | "dodge"
  | "stun"
  | "double-attack"
  | "attack-bonus-next3"
  | "battle-cry";
export const COMMON_MOVE_POOL: MovePool<COMMON_MOVE_NAMES> = {
  nothing: {
    moveId: "nothing",
    type: "move",
    name: "Do nothing",
    description: "Do nothing...",
    priorityClass: 0,
    targetingMethod: "self",

    perform: async function (
      battle: Battle,
      source: SideId,
      targetingData: TargetingData
    ) {
      throw new Error("This action should not be used EVER.");
    },
    onFail: async function (battle: Battle, source: SideId): Promise<void> {},
  },

  "attack-normal": {
    moveId: "attack-normal",
    type: "move",
    name: "Attack",
    description: "A regular attack that consumes one attack charge.",
    icon: "wolverine-claws.svg",
    priorityClass: 0,
    targetingMethod: "single-enemy",

    perform: async function (
      battle: Battle,
      source: SideId,
      targetingData: SingleEnemyTargeting
    ) {
      const target: SideId = targetingData.target;
      const sourceMonster: Monster = battle.sides[source].monster;

      // Initialize attackCharges if missing
      if (sourceMonster.attackCharges == null) {
        sourceMonster.attackCharges = 1;
      }

      // Check if any charges left
      if (sourceMonster.attackCharges <= 0) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source,
          target: source,
          moveId: this.moveId,
          reason: "No attack charges remaining",
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      // Consume one charge
      if (sourceMonster.attackCharges != 0){
        sourceMonster.attackCharges -= 1;
      }

      // Perform attack
      await default_attack(this, battle, source, target);
    },

    onFail: async function (battle: Battle, source: SideId): Promise<void> {},
  },

  defend: {
    moveId: "defend",
    type: "move",
    name: "Defend",
    description: "Increase your armor temporarily and regain 1 attack charge.",
    icon: "vibrating-shield.svg",
    priorityClass: 5,
    targetingMethod: "self",

    async perform(battle: Battle, source: SideId): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;

      // Add +1 attack charge when defending
      if (sourceMonster.attackCharges < 3) {
        sourceMonster.attackCharges += 1;
      }

      // Apply defense buff
      const defenseComponent: DefendComponent = new DefendComponent(1, 2);
      sourceMonster.components.push(defenseComponent);

      const buffEvent: BuffEvent = {
        name: "buff",
        source,
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
    async perform(
      battle: Battle,
      source: SideId,
      targetingData: SelfTargeting
    ): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;

      const dodgeChargeComponent: DodgeChargeComponent | null = getComponent(
        sourceMonster,
        "dodgeCharges"
      );
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

      const dodgeComponent: DodgeStateComponent | null = getComponent(
        sourceMonster,
        "dodging"
      );
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
    description:
      "Stun the monster, preventing it from taking actions for one turn.",
    priorityClass: 3,
    targetingMethod: "single-enemy",
    async perform(
      battle: Battle,
      source: SideId,
      targetingData: SingleEnemyTargeting
    ): Promise<void> {
      const sourceMonster: Monster = battle.sides[source].monster;
      const target: SideId = targetingData.target;
      const targetMonster: Monster = battle.sides[target].monster;

      const abilityChargeStunComponent: AbilityChargeStunComponent | null =
        getComponent(sourceMonster, "abilityChargeStun");
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

      const stunnedComponent: StunnedStateComponent | null = getComponent(
        targetMonster,
        "stunned"
      );
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

  "double-attack": {
    moveId: "double-attack",
    type: "move",
    name: "Double Attack",
    description: "Attack the target twice. Can only be used once per battle.",
    priorityClass: 1,
    targetingMethod: "single-enemy",

    perform: async function (
      battle: Battle,
      source: SideId,
      targetingData: SingleEnemyTargeting
    ) {
      const target: SideId = targetingData.target;
      const sourceMonster: Monster = battle.sides[source].monster;

      // Track usage with a temporary property
      if ((sourceMonster as any)._doubleAttackUsed) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source: source,
          target: source,
          moveId: this.moveId,
          reason: "Double attack already used",
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      // Mark as used
      (sourceMonster as any)._doubleAttackUsed = true;

      // Perform the attack twice
      await default_attack(this, battle, source, target);
      await default_attack(this, battle, source, target);
    },

    onFail: async function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },

  "attack-bonus-next3": {
    moveId: "attack-bonus-next3",
    type: "move",
    name: "Fury Boost",
    description:
      "Your next 3 attacks deal +3 damage each. Can only be used once per battle.",
    priorityClass: 2,
    targetingMethod: "self",

    perform: async function (battle: Battle, source: SideId) {
      const sourceMonster: Monster = battle.sides[source].monster;

      // Track usage per battle
      if ((sourceMonster as any)._attackBonusUsed) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source,
          target: source,
          moveId: this.moveId,
          reason: "Fury Boost already used",
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      // Mark as used
      (sourceMonster as any)._attackBonusUsed = true;

      // Add the bonus component
      sourceMonster.components.push(new NextAttacksBonusComponent(3, 3));
    },

    onFail: async function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },

  "battle-cry": {
    moveId: "battle-cry",
    type: "move",
    name: "Battle Cry",
    description:
      "Increase your attack and armour by +2 for the rest of the battle. Can only be used once per battle.",
    priorityClass: 2,
    targetingMethod: "self",

    perform: async function (battle: Battle, source: SideId) {
      const sourceMonster: Monster = battle.sides[source].monster;

      // Track usage per battle
      if ((sourceMonster as any)._battleCryUsed) {
        const failedEvent: MoveFailedEvent = {
          name: "moveFailed",
          source,
          target: source,
          moveId: this.moveId,
          reason: "Battle Cry already used",
        };
        battle.eventHistory.addEvent(failedEvent);
        return;
      }

      // Mark as used
      (sourceMonster as any)._battleCryUsed = true;

      // Apply permanent stat buff
      sourceMonster.components.push(new PermanentStatBuffComponent(2, 2));

      // Emit BuffEvent
      const buffEvent: BuffEvent = {
        name: "buff",
        source,
        target: source,
        buffs: { attack: 2, armour: 2 },
      };
      battle.eventHistory.addEvent(buffEvent);
    },

    onFail: async function (battle: Battle, source: SideId): Promise<void> {
      throw new Error("Function not implemented.");
    },
  },
};
