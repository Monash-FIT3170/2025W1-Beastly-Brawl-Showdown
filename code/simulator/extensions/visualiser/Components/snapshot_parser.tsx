import { SnapshotEvent } from "../../core/event/core_events"

console.log("snapshot parser loaded")
export function parseSnapshot(snapshot: SnapshotEvent) {
  return snapshot.sides.map((side) => ({
    id: side.id,
    name: side.monster.base.name,
    image: side.monster.base.imageUrl,
    health: side.monster.health,
    armour: side.monster.base.baseStats.armour,
    defendActionCharge: side.monster.defendActionCharges,
  }));
}