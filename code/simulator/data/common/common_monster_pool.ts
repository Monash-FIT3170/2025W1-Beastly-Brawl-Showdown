import { Battle } from "../../core/battle";
import { RerollChargeComponent, DodgeChargeComponent } from "../../core/monster/component/core_components";
import { MonsterPool } from "../../core/monster/monster_pool";
import { SideId } from "../../core/side";

type MONSTER_IDS = "blank" | "mystic_wryven" | "shadow_fang" | "stone_hide" | "fleet_foot" | 
"knight" | "sea_urchin" | "lion" | "bear" | "shield";
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
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    mystic_wryven: {
      templateId: "mystic_wryven",
      name: "Mystic Wyvern",
      description: "A mystical creature of the skies. A Balanced Monster.",
      imageUrl: "/assets/monsters/dragon.png",
      baseStats: {
        health: 50,
        armour: 9,
        attack: 2,
        speed: 5,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
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
      imageUrl: "/assets/monsters/wolf.png",
      baseStats: {
        health: 40,
        armour: 7,
        attack: 4,
        speed: 7,
        crit_chance: 7,
        crit_damage: 7,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
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
      imageUrl: "/assets/monsters/turtle.png",
      baseStats: {
        health: 60,
        armour: 11,
        attack: 1,
        speed: 3,
        crit_chance: 2,
        crit_damage: 1,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 4,
      abilityActionId: "stun",
      onSpawnActions: [],
    },

    fleet_foot: {
      templateId: "fleet_foot",
      name: "Fleet Foot Stalker",
      description: "A swift and elusive hunter. Excels in dealing multi-hit damage.",
      imageUrl: "/monsters/owl.png",
      baseStats: {
        health: 32,
        armour: 8,
        attack: 3,
        speed: 4,
        crit_chance: 7,
        crit_damage: 7,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    knight: {
      templateId: "knight",
      name: "Knight",
      description: "A brave and noble warrior. A Balanced Monster.",
      imageUrl: "/monsters/knight.png",
      baseStats: {
        health: 50,
        armour: 10,
        attack: 2,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    sea_urchin: {
      templateId: "sea_urchin",
      name: "Sea Urchin",
      description: "A prickly marine creature. A Defense Monster that deals damage back when hit.",
      imageUrl: "/monsters/sea_urchin.png",
      baseStats: {
        health: 60,
        armour: 10,
        attack: 0,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    lion: {
      templateId: "lion",
      name: "Lion",
      description: "A fierce and majestic predator. An Attack Monster that excels in hitting hard.",
      imageUrl: "/monsters/lion.png",
      baseStats: {
        health: 36,
        armour: 6,
        attack: 5,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    bear: {
      templateId: "bear",
      name: "Bear",
      description: "A strong and resilient creature. A Balanced Monster that goes berserk.",
      imageUrl: "/monsters/bear.png",
      baseStats: {
        health: 50,
        armour: 9,
        attack: 2,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },

    shield: {
      templateId: "shield",
      name: "Shield",
      description: "A shield that once belonged to a knight gained sentience. A defender monster with inate damage reduction.",
      imageUrl: "/monsters/shield.png",
      baseStats: {
        health: 60,
        armour: 12,
        attack: 1,
        speed: 4,
        crit_chance: 5,
        crit_damage: 2,
      },
      attackActionId: "attack-normal",
      defendActionId: "defend",
      maxAttackCharges: 3,
      onSpawnActions: [],
    },
  },
} as const;
