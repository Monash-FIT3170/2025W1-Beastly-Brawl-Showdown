import { SnapshotEvent } from "../../../simulator/core/event/core_events";
import { COMMON_MONSTER_POOL } from "../../../simulator/data/common/common_monster_pool";

console.log("snapshot parser loaded");


export function parseSnapshot(snapshot: SnapshotEvent) {
  return snapshot.sides.map((side) => {
    // Look up the MonsterTemplate using the baseID
    const template = COMMON_MONSTER_POOL.monsters[
      side.monster.baseID as keyof typeof COMMON_MONSTER_POOL.monsters
    ];
    // console.log("Monster template for", side.monster.baseID, template);
    return {
      id: side.id,
      name: template.name,
      image: template.imageUrl,
      health: side.monster.health,
      defendActionCharge: side.monster.defendActionCharges,
    };
  });
}