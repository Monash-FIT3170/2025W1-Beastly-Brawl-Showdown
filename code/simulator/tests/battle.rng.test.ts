import { roll } from "../core/roll";
import { makeBattle } from "./testUtils";
import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";

describe("Battle RNG", () => {
    test("produces deterministic results with the same seed", () => {
        const battle1 = makeBattle(123);
        const battle2 = makeBattle(123);

        const rolls1 = [battle1.rng.next(), battle1.rng.next(), battle1.rng.next()];
        const rolls2 = [battle2.rng.next(), battle2.rng.next(), battle2.rng.next()];
        expect(rolls1).toEqual(rolls2);
    });

    test("different seeds give different sequences", () => {
        const battle1 = makeBattle(111);
        const battle2 = makeBattle(999);

        const rolls1 = [battle1.rng.next(), battle1.rng.next(), battle1.rng.next()];
        const rolls2 = [battle2.rng.next(), battle2.rng.next(), battle2.rng.next()];

        expect(rolls1).not.toEqual(rolls2);
    });
});

describe("Rolling dice during battle", () => {
    test("attacks always roll a d20 result from 1 up to 20", () => {
        const battle = makeBattle(123);

        // Roll a d20 100 times, ensure all results are between 1 and 20
        for (let i = 0; i < 100; i++) {
            const result = roll(battle.rng, 20);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(20);
        }
    });

    test("attack bonus is applied correctly", () => {
        const battle = makeBattle(123);
        const rolled = roll(battle.rng, 20);
        const attackBonus = COMMON_MONSTER_POOL.monsters.shadow_fang.baseStats.attack;
        const total = rolled + attackBonus;
        expect(total).toBe(rolled + 4);
    });
});
