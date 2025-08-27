import { EntryID } from "../utils";
import { BaseComponent } from "./component/component";
import { ComponentKindMap } from "./component/core_components";
import { MonsterStatType } from "./monster_stats";
import { MonsterTemplate } from "./monster_template";

export interface Monster {
  //# Template
  /**
   * The key to the template that this monster is based on
   */
  baseID: EntryID;

  //# Resources
  /**
   * The current health
   */
  health: number;

  /**
   * How many times can the monster defend in a round
   */
  defendActionCharges: number;

  //# Components
  /**
   * The components attached to this monster
   */
  components: Array<BaseComponent>;
}

//# Component Utils
export function getComponent<K extends keyof ComponentKindMap>(monster: Monster, kind: K): ComponentKindMap[K] | null {
  return monster.components.find((component): component is ComponentKindMap[K] => component.kind === kind) || null;
}

export function getComponents<K extends keyof ComponentKindMap>(monster: Monster, kind: K): ComponentKindMap[K][] {
  return monster.components.filter((component): component is ComponentKindMap[K] => component.kind === kind);
}

export function removeComponent(monster: Monster, component: BaseComponent) {
  monster.components.splice(monster.components.indexOf(component));
}

export function getStat(statType: MonsterStatType, monster: Monster, monsterTemplate: MonsterTemplate): number {
  return getBaseStat(statType, monsterTemplate) + getStatBonus(statType, monster);
}
export function getBaseStat(statType: MonsterStatType, monsterTemplate: MonsterTemplate): number {
  return monsterTemplate.baseStats[statType]!;
}
export function getStatBonus(statType: MonsterStatType, monster: Monster): number {
  return monster.components
    .filter((component) => component.getStatBonus !== undefined) /// Does it even implement a stat bonus
    .map((component) => component.getStatBonus!(statType)) /// Get the stat bonus
    .filter((bonus) => bonus !== null) /// If there was no bonus - ignore
    .reduce((totalBonus, bonus) => totalBonus + bonus, 0); /// Sum
}

export function getIsBlockedFromMove(monster: Monster) {
  return monster.components.filter((component) => component.getIsBlockedFromMove !== undefined).some((component) => component.getIsBlockedFromMove!());
}

export { MonsterTemplate };
