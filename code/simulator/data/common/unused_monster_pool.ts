import { Battle } from "../../core/battle";
import {
    AdvantageComponent,
    AbilityChargeComponent,
} from "../../core/monster/component/core_components";
import { MonsterPool } from "../../core/monster/monster_pool";
import { SideId } from "../../core/side";

type MONSTER_IDS =
    | "knight"
    | "bear"
export const COMMON_MONSTER_POOL: MonsterPool<MONSTER_IDS> = {
    name: "common_monster_pool",
    monsters: {
        knight: {
            templateId: "knight",
            name: "Knight",
            description:
                "A brave and noble warrior. A Balanced Monster that always makes advantageous decisions.",
            imageUrl: "/assets/monsters/knight.png",
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
            onSpawnActions: [
                {
                    type: "spawnAction",
                    do: async function (world: Battle, source: SideId): Promise<void> {
                        world.sides[source].monster.components.push(
                            new AdvantageComponent()
                        );
                    },
                },
            ],
        },

        bear: {
            templateId: "bear",
            name: "Bear",
            description:
                "A strong and resilient creature. A Balanced Monster that sets up to go berserk.",
            imageUrl: "/assets/monsters/bear.png",
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
            abilityActionId: "battle-cry",
            onSpawnActions: [
                {
                    type: "spawnAction",
                    do: async function (world: Battle, source: SideId): Promise<void> {
                        world.sides[source].monster.components.push(
                            new AbilityChargeComponent("battle-cry", 3)
                        );
                    },
                },
            ],
        },
    },
} as const;
