/**
 * The set of all possible stat types for a monster
 */
export type MonsterStatType = "health" | "armour" | "attack" | "speed" | "crit_chance" | "crit_damage";
/**
 * Holds a set of the stats
 */
export type MonsterStats = Record<MonsterStatType, number>;
