export type EntryID = Lowercase<string>;

/**
 * A record-like type that enforces:
 * - For a given set of keys (`ACCEPTED_KEYS`):
 *   - All keys must be present (exhaustive)
 * - Each key (`ROW_KEY`) maps to a `VALUE`:
 *   - `VALUE` must contain a property named `DISCRIMINANT_NAME`
 *   - The value of that property must match its corresponding `ROW_KEY`
 *
 * @template ACCEPTED_KEYS - Union of all keys to be present in the record
 * @template DISCRIMINANT_NAME - Name of the discriminant property in each value
 * @template VALUE - The object type assigned to each key, which must include `DISCRIMINANT_NAME`
 */

export type LookupTable<ACCEPTED_KEYS extends PropertyKey, DISCRIMINANT_NAME extends PropertyKey, VALUE extends { [K in DISCRIMINANT_NAME]: PropertyKey }> = {
  [ROW_KEY in ACCEPTED_KEYS]: VALUE & { [K in DISCRIMINANT_NAME]: ROW_KEY };
};


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