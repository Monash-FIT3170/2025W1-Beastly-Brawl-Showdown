import React, { useState } from 'react';

// A BattleMonster class? basically just returns a battlemonster spritte with its hp bar, should make a funciton in future to make the hp depend on the specific monster
export const BattleMonster = ({ image, alt, position }) => {
  const [hp, setHp] = useState(100);

  const updateHp = (newHp) => {
    setHp(newHp)
  };
  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max="100" className="hpBar"></progress>
        <span className="hpLabel">HP</span>
      </div>
      <img className="battleMonsterImg" src={image} alt={alt} />
    </div>
  );
};
