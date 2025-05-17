import React from 'react';

// Define the props using a TypeScript type
type BattleBottomProps = {
  onRoll: () => void;
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onRoll }) => {
  const handleRoll = () => {
    onRoll();
  };

  return (
    <div className="battleScreenBottom">
      <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className="battleScreenBottomButtonImage" src="/img/sword.png" alt="Sword" />
      </button>
      <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className="battleScreenBottomButtonImage" src="/img/ability.jpg" alt="Ability" />
      </button>
      <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className="battleScreenBottomButtonImage" src="/img/shield.png" alt="Shield" />
      </button>
    </div>
  );
};