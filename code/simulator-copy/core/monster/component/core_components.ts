import { Battle } from "../../battle";
import { SideId } from "../../side";
import { removeComponent } from "../monster";
import { MonsterStatType } from "../monster_stats";
import { BaseComponent } from "./component";

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

type CommonComponentTypes =
  | typeof RerollChargeComponent
  | typeof DodgeChargeComponent
  | typeof DodgeStateComponent
  | typeof DefendComponent
  | typeof AbilityChargeStunComponent
  | typeof StunnedStateComponent
  | typeof SpeedModifierComponent;
//# Map it then export
type ComponentInstanceType = InstanceType<CommonComponentTypes>;
export type ComponentKindMap = {
  [K in ComponentInstanceType["kind"]]: Extract<ComponentInstanceType, { kind: K }>;
};
