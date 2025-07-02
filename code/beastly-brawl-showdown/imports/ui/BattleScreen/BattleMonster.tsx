import React from 'react';
import Monsters from '/imports/data/monsters/Monsters';

type BattleMonsterProps = {
  monster: Monsters;
  position: string; // "monster1" or "monster2"
};

export const BattleMonster: React.FC<BattleMonsterProps> = ({ monster, position }) => {
  const hp = monster.currentHealth;
  const maxHp = monster.baseHealth;

  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max={maxHp} className="hpBar" />
        <span className="hpLabel">{hp} / {maxHp} HP</span>
      </div>
      <img className="battleMonsterImg" src={monster.imageUrl} alt={monster.monsterName} />
    </div>
  );
};
