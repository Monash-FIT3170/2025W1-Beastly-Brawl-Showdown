import React from 'react';
type BattleBottomProps = {
  onAction: (action: 'attack' | 'defend' | 'ability') => void;
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onAction }) => {
  return (
    <div className="battleScreenBottom">
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('attack')}
      >
        <img src="/img/sword.png" alt="Sword" className="battleScreenBottomButtonImage" />
      </button>
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('ability')}
      >
        <img src="/img/ability.jpg" alt="Ability" className="battleScreenBottomButtonImage" />
      </button>
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('defend')}
      >
        <img src="/img/shield.png" alt="Shield" className="battleScreenBottomButtonImage" />
      </button>
    </div>
  );
};
