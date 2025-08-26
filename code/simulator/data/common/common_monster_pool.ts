import { Battle } from "@beastly-brawl-showdown/sim-core/battle";
import { RerollChargeComponent, DodgeChargeComponent } from "@beastly-brawl-showdown/sim-core/monster/component/core_components";
import { MonsterPool } from "@beastly-brawl-showdown/sim-core/monster/monster_pool";
import { SideId } from "@beastly-brawl-showdown/sim-core/side";

type MONSTER_IDS = "blank" | "mystic_wryven" | "shadow_fang" | "stone_hide";
export const COMMON_MONSTER_POOL: MonsterPool<MONSTER_IDS> = {
  name: "common_monster_pool",
  monsters: {
    blank: {
      templateId: "blank",
      name: "BlankMon",
      description: "Desc for Blank",
      imageUrl: "",
      baseStats: {
        health: 25,
        armour: 15,
        attack: 2,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      baseDefendActionCharges: 3,
      onSpawnActions: [],
    },

    mystic_wryven: {
      templateId: "mystic_wryven",
      name: "Mystic Wyvern",
      description: "A mystical creature of the skies. A Balanced Monster.",
      imageUrl: "/img/monster-selection-images/placeholder_monster_1.png",
      baseStats: {
        health: 25,
        armour: 14,
        attack: 2,
        speed: 5,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      baseDefendActionCharges: 3,
      onSpawnActions: [
        {
          type: "spawnAction",
          do: async function (world: Battle, source: SideId): Promise<void> {
            world.sides[source].monster.components.push(new RerollChargeComponent(1));
          },
        },
      ],
    },

    shadow_fang: {
      templateId: "shadow_fang",
      name: "Shadow Fang Predator",
      description: "A stealthy and cunning beast. An Attack Monster.",
      imageUrl: "/img/monster-selection-images/placeholder_monster_2.png",
      baseStats: {
        health: 20,
        armour: 12,
        attack: 4,
        speed: 7,
        crit_chance: 7,
        crit_damage: 7,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      baseDefendActionCharges: 3,
      abilityActionId: "dodge",
      onSpawnActions: [
        {
          type: "spawnAction",
          do: async function (world: Battle, source: SideId): Promise<void> {
            world.sides[source].monster.components.push(new DodgeChargeComponent(1));
          },
        },
      ],
    },

    stone_hide: {
      templateId: "stone_hide",
      name: "Stone Hide Guardian",
      description: "A sturdy and resilient protector. A Defense Monster.",
      imageUrl: "/img/monster-selection-images/placeholder_monster_3.png",
      baseStats: {
        health: 30,
        armour: 16,
        attack: 1,
        speed: 3,
        crit_chance: 2,
        crit_damage: 1,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      baseDefendActionCharges: 4,
      abilityActionId: "stun",
      onSpawnActions: [],
    },
  },
} as const;
