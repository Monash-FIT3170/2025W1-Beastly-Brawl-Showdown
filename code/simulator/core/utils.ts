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
