import React, { useState } from 'react';

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
