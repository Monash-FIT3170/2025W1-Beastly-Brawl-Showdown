import { Battle, BattleOptions } from "../core/battle";
import { roll } from "../core/roll";
import type { EntryID } from "../core/types";

import { MonsterPool } from "../data/monster_pool";

describe("Battle RNG", () => {
    test("produces deterministic results with the same seed", () => {
        const opts1: BattleOptions = {
            seed: 123,
            playerOptionSet: [{ monsterTemplate: MonsterPool[0] }],
        };
        const opts2: BattleOptions = {
            seed: 123,
            playerOptionSet: [{ monsterTemplate: MonsterPool[1] }],
        };

        const battle1 = new Battle(opts1);
        const battle2 = new Battle(opts2);

        const rolls1 = [battle1.rng.next(), battle1.rng.next(), battle1.rng.next()];
        const rolls2 = [battle2.rng.next(), battle2.rng.next(), battle2.rng.next()];
        //Same seed should produce same sequences
        expect(rolls1).toEqual(rolls2);
    });

    test("different seeds give different sequences", () => {
        const opts1: BattleOptions = {
            seed: 111,
            playerOptionSet: [{ monsterTemplate: MonsterPool[0] }],
        };
        const opts2: BattleOptions = {
            seed: 999,
            playerOptionSet: [{ monsterTemplate: MonsterPool[1] }],
        };

        const battle1 = new Battle(opts1);
        const battle2 = new Battle(opts2);

        const rolls1 = [battle1.rng.next(), battle1.rng.next(), battle1.rng.next()];
        const rolls2 = [battle2.rng.next(), battle2.rng.next(), battle2.rng.next()];

        //Different seeds should produce different sequences
        expect(rolls1).not.toEqual(rolls2);
    });
});

describe("Rolling dice during battle", () => {
    test("attacks always roll a d20 result from 1 up to 20", () => {
        const opts = {
            seed: 123,
            playerOptionSet: [{ monsterTemplate: MonsterPool[0] }],
        };

        const battle = new Battle(opts);

        // Roll a d20 100 times, ensure all results are between 1 and 20
        for (let i = 0; i < 100; i++) {
            const result = roll(battle.rng, 20);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(20);
        }
    });

    test("attack bonus is applied correctly", () => {
        const opts = {
            seed: 123,
            // Shadow Fang Predator (attack = 4)
            playerOptionSet: [{ monsterTemplate: MonsterPool[2] }],
        };

        const battle = new Battle(opts);
        const rolled = roll(battle.rng, 20);
        const attackBonus = MonsterPool[2].baseStats.attack;
        const total = rolled + attackBonus;
        expect(total).toBe(rolled + 4);
    });
});
