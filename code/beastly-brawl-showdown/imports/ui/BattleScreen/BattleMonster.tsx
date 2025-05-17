import React, { useState } from 'react';

// Define props for the BattleMonster component
type BattleMonsterProps = {
  image: string;
  alt: string;
  position: string; // e.g., "monster1" or "monster2"
};

export const BattleMonster: React.FC<BattleMonsterProps> = ({ image, alt, position }) => {
  const [hp, setHp] = useState<number>(100);

  const updateHp = (newHp: number): void => {
    setHp(newHp);
  };

  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max={100} className="hpBar"></progress>
        <span className="hpLabel">HP</span>
      </div>
      <img className="battleMonsterImg" src={image} alt={alt} />
    </div>
  );
};
