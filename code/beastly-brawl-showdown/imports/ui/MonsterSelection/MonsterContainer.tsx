import React from "react";
import { MonsterPool } from "/imports/simulator/data/monster_pool";

export const MonsterContainer = ({
  name,
  type,
  currentlySelectedMonster,
}: {
  name: string;
  type: string;
  currentlySelectedMonster: (name: string) => void;
}) => {
  function onClick() {
    currentlySelectedMonster(name);
  }

  // Find the monster data by name (fallback if not found)
  const monster = MonsterPool.find((m) => m.name === name);

  return (
    <div className="monster-selection-card" id={name} onClick={onClick}>
      <div className="monster-avatar">
        <img src={monster?.imageUrl} alt={name} />
      </div>
      <div className="monster-selection-card-info">
        <div className="monster-name">{monster?.name || name}</div>
        <div className="monster-type">{type}</div>
        <div className="monster-desc">{monster?.description || "No description"}</div>
        {monster?.abilityActionId && (
          <div className="ability-desc">Ability: {monster.abilityActionId}</div>
        )}
      </div>
    </div>
  );
};
