import { LookupTable } from "../utils";
import { MonsterTemplate } from "./monster_template";

export type MonsterId = Lowercase<string>;

export interface MonsterPool<MONSTER_NAME extends MonsterId = MonsterId> {
  name: string;
  monsters: Readonly<LookupTable<MONSTER_NAME, "templateId", MonsterTemplate>>;
}
