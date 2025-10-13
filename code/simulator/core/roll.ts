import { PRNG } from "./prng";

export function roll(rng: PRNG, sides: number): number {
  return Math.floor(rng.next() * sides) + 1;
}
