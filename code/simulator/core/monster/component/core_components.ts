import type { Battle } from "../../battle";
import type { SideId } from "../../side";
import { removeComponent } from "../monster";
import type { MonsterStatType } from "../monster_stats";
import type { BaseComponent } from "./component";

export class RerollChargeComponent implements BaseComponent<"reroll"> {
  kind = "reroll" as const;
  charges: number;

  constructor(charges: number) {
    this.charges = charges;
  }
}

export class DodgeChargeComponent implements BaseComponent<"dodgeCharges"> {
  kind = "dodgeCharges" as const;
  charges: number;
  constructor(charges: number) {
    this.charges = charges;
  }
}
export class DodgeStateComponent implements BaseComponent<"dodging"> {
  kind = "dodging" as const;
  remainingDuration: number;
  constructor(duration: number) {
    this.remainingDuration = duration;
  }

  onEndTurn(battle: Battle, selfSide: SideId): void {
    this.remainingDuration--;
    if (this.remainingDuration <= 0) {
      removeComponent(battle.sides[selfSide].monster, this);
    }
  }
}

export class DefendComponent implements BaseComponent<"defend"> {
  kind = "defend" as const;
  remainingDuration: number;
  bonusArmour: number;

  constructor(duration: number, bonusArmour: number) {
    this.remainingDuration = duration;
    this.bonusArmour = bonusArmour;
  }

  getStatBonus(statType: MonsterStatType) {
    if (statType === "armour") {
      return this.bonusArmour;
    }
    return null;
  }
  onEndTurn(battle: Battle, selfSide: SideId): void {
    this.remainingDuration--;
    if (this.remainingDuration <= 0) {
      removeComponent(battle.sides[selfSide].monster, this);
    }
  }
}

export class AbilityChargeStunComponent implements BaseComponent<"abilityChargeStun"> {
  kind = "abilityChargeStun" as const;
  charges: number;
  constructor(charges: number) {
    this.charges = charges;
  }
}
export class StunnedStateComponent implements BaseComponent<"stunned"> {
  kind = "stunned" as const;
  remainingDuration: number;
  constructor(duration: number) {
    this.remainingDuration = duration;
  }

  getIsBlockedFromMove = () => true;

  onEndTurn(battle: Battle, selfSide: SideId): void {
    this.remainingDuration--;
    if (this.remainingDuration <= 0) {
      removeComponent(battle.sides[selfSide].monster, this);
    }
  }
}

export class SpeedModifierComponent implements BaseComponent<"speedModifier"> {
  kind = "speedModifier" as const;
  speedBonus: number;

  constructor(speedBonus: number) {
    this.speedBonus = speedBonus;
  }

  getStatBonus(statType: MonsterStatType) {
    if (statType === "speed") {
      return this.speedBonus;
    }
    return null;
  }
}

export class NextAttacksBonusComponent implements BaseComponent<"nextAttacksBonus"> {
  kind = "nextAttacksBonus" as const;
  remainingAttacks: number;
  bonusDamage: number;

  constructor(remainingAttacks: number, bonusDamage: number) {
    this.remainingAttacks = remainingAttacks;
    this.bonusDamage = bonusDamage;
  }
}


export class ThornsComponent implements BaseComponent<"thorns"> {
  kind = "thorns" as const;
  damage: number;

  constructor(damage: number = 1) {
    this.damage = damage;
  }

  // This method will be triggered when the monster is hit
  onHit(battle: Battle, selfSide: SideId, attackerSide: SideId) {
    const attacker = battle.sides[attackerSide].monster;
    attacker.health -= this.damage;
  }
}


export class DamageReductionComponent implements BaseComponent<"damageReduction"> {
  kind = "damageReduction" as const;
  reductionAmount: number;

  constructor(reductionAmount: number) {
    this.reductionAmount = reductionAmount;
  }

  getReduction() {
    return this.reductionAmount;
  }
}

export class AdvantageComponent implements BaseComponent<"advantage"> {
  kind = "advantage" as const;
}

export class PermanentStatBuffComponent implements BaseComponent<"permanentStatBuff"> {
  kind = "permanentStatBuff" as const;
  attackBonus: number;
  armourBonus: number;

  constructor(attackBonus: number, armourBonus: number) {
    this.attackBonus = attackBonus;
    this.armourBonus = armourBonus;
  }

  getStatBonus(statType: MonsterStatType) {
    if (statType === "attack") return this.attackBonus;
    if (statType === "armour") return this.armourBonus;
    return null;
  }
}

type CommonComponentTypes =
  | typeof RerollChargeComponent
  | typeof DodgeChargeComponent
  | typeof DodgeStateComponent
  | typeof DefendComponent
  | typeof AbilityChargeStunComponent
  | typeof StunnedStateComponent
  | typeof SpeedModifierComponent
  | typeof NextAttacksBonusComponent
  | typeof ThornsComponent
  | typeof DamageReductionComponent
  | typeof AdvantageComponent
  | typeof PermanentStatBuffComponent;
//# Map it then export
type ComponentInstanceType = InstanceType<CommonComponentTypes>;
export type ComponentKindMap = {
  [K in ComponentInstanceType["kind"]]: Extract<ComponentInstanceType, { kind: K }>;
};
