import { Monster } from "./monster";

export type Component = {
  name: string;

  [key: string]: any;
};

const FUNCTION_ATTRIBUTE_LABEL = "function";
export function hasEvent(component: Component, eventName: string) {
  return typeof component[eventName] === FUNCTION_ATTRIBUTE_LABEL;
}

export function getComponent(entity: Monster, name: string): Component | null {
  for (const component of entity.components) {
    if (component.name === name) {
      return component;
    }
  }
  return null;
}

export function getComponentAll(entity: Monster, name: string): Component[] {
  return entity.components.filter((component) => component.name === name);
}

export function addComponent(entity: Monster, component: Component): void {
  if (!entity.components) {
    entity.components = [];
  }
  entity.components.push(component);
}

export function createRerollAttackComponent(): Component {
  return {
    name: "rerollAttack",
    description: "Allows the monster to reroll an attack once per turn.",
    charges: 1,

    use: function () {
      if (this.charges > 0) {
        this.charges--;
        return true; // Reroll successful
      }
      return false; // No charges left
    },
  };
}

export function createDodgeComponent(): Component {
  return {
    name: "dodge",
    description: "Allows the monster to dodge an attack, increasing its armor class temporarily.",
    charges: 1,

    use: function () {
      if (this.charges > 0) {
        this.charges--;
        return true; // Dodge successful
      }
      return false; // No charges left
    },
  };
}

export function createStunComponent(): Component {
  return {
    name: "stun",
    description: "Stuns the monster, preventing it from taking actions for one turn.",
    duration: 2, // Stun lasts for two turn
    onTurnStart: function () {
      if (this.duration > 0) {
        this.duration--;
      }
    },
    isStunned: function () {
      return this.duration > 0;
    },
  };
}

export function createGreaterCritComponent(): Component {
  return {
    name: "greaterCrit",
    description: "Allows the monster to score a greater critical hit, doubling the damage dealt.",

    use: function () {
      if (this.charges > 0) {
        this.charges--;
        return true; // Greater crit successful
      }
      return false; // No charges left
    },
  };
}