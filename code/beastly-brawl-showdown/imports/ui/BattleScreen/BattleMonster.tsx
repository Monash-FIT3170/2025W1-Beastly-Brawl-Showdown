import React, { useState } from 'react';

// Define props for the BattleMonster component
type BattleMonsterProps = {
  image: string;
  alt: string;
  position: string; // e.g., "monster1" or "monster2"
};


//when making, give it an image, an alt for the blind and which monster position it is in, 1 for left, 2 for right
export const BattleMonster: React.FC<BattleMonsterProps> = ({ image, alt, position }) => {
  // const [hp, setHp] = useState<number>(100);
  const [hp] = useState<number>(100);

  // //just updates the hp bar, doesn't really work noww but no monsters now anyway
  // const updateHp = (newHp: number): void => {
  //   setHp(newHp);
  // };

  return (
    <div className={position}>
      <div className="progressContainer">
        {/* hp bar */}
        <progress value={hp} max={100} className="hpBar"></progress>
        <span className="hpLabel">HP</span>
      </div>
      <img className="battleMonsterImg" src={image} alt={alt} />
    </div>
  );
};
