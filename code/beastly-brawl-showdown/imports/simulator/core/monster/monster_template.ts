import { SpawnAction } from "../action/spawn_action";
import { EntryID } from "../utils";
import { MonsterId } from "./monster_pool";
import { MonsterStats } from "./monster_stats";

/**
 * A base template for a monster
 */
export type MonsterTemplate = {
  /**
   * The ID of this template
   */
  templateId: MonsterId;
  //# Flavour
  /**
   * The display name (NOT ID).
   */
  name: string;
  description: string;
  imageUrl: string;

  //# Stats
  baseStats: MonsterStats;

  //# Action
  attackActionId: EntryID;
  defendActionId: EntryID;
  /**
   * Number of attacks that can be performed
   */
  maxAttackCharges: number;
  /** 
   * Active ability id
   * 
   * - Optional
   */
  abilityActionId?: EntryID;
  /** 
   * Actions to perform when spawning. 
   * 
   * This includes: 
   * - Attaching passives as components
   * - Initialising active ability charges as components
   * - On spawn effects
   */
  onSpawnActions: SpawnAction[];
};