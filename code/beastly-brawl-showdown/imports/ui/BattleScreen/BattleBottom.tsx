import React from 'react';

type BattleBottomProps = {
  onRoll: () => void;
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onRoll }) => {
  const handleRoll = () => {
    onRoll();
    //basically just clals whatever function is given to this as a parameter
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