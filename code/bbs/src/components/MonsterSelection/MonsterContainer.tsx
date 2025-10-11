import { COMMON_MONSTER_POOL } from "../../../../simulator/data/common/common_monster_pool";

export const MonsterContainer = ({
  name,
  desc,
  currentlySelectedMonster,
}: {
  name: string;
  desc: string;
  currentlySelectedMonster: (name: string) => void;
}) => {
  function onClick() {
    currentlySelectedMonster(name);
  }

  // Find the monster data by name (fallback if not found)
  const monster = Object.values(COMMON_MONSTER_POOL.monsters).find(
    (m) => m.name === name
  );

  return (
    <div className="monster-selection-card" id={name} onClick={onClick}>
      <div className="monster-avatar">
        <img src={monster?.imageUrl} alt={name} />
      </div>
      <div className="monster-selection-card-info">
        <div className="monster-name">{monster?.name || name}</div>
        <div className="monster-desc">{desc || "No description"}</div>
        <div className="monster-stats" id="attack">Attack bonus: {monster?.baseStats.attack}</div>
        <div className="monster-stats" id="AC">Armour: {monster?.baseStats.armour}</div>
        
        {monster?.abilityActionId && (
          <div className="ability-desc">Ability: {monster.abilityActionId}</div>
        )}
      </div>
    </div>
  );
};
