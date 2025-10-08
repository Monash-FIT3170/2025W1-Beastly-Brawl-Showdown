import { COMMON_MONSTER_POOL } from "../simulator/data/common/common_monster_pool";

//#region Logging
/// See: https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
export function log_notice(val: any) {
  console.log("\x1b[38;5;0m[Notice]\x1b[0m", val);
}

export function log_warning(val: any) {
  console.log("\x1b[38;5;3m[Warning]\x1b[0m", val);
}

export function log_attention(val: any) {
  console.log("\x1b[4;38;5;9m[Attention]\x1b[0m", val);
}

export function log_event(val: any) {
  console.log("\x1b[38;5;6m[Event]\x1b[0m", val);
}
//#endregion

// Random monster pool
export function getRandomPool(n: number): string[] {
  const allKeys = Object.keys(COMMON_MONSTER_POOL.monsters).filter((k) => k !== "blank");
  const shuffled = [...allKeys];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}
