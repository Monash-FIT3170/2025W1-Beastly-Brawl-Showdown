import React from "react";

type BattleBottomProps = {
  onAction: (action: 'attack' | 'defend' | 'ability') => void;
  disabled?: boolean;
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onAction, disabled }) => {
  return (
    <div className="battleScreenBottom">
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('attack')}
        disabled={disabled}
      >
        <img src="/img/sword.png" alt="Sword" className="battleScreenBottomButtonImage" />
      </button>
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('ability')}
        disabled={disabled}
      >
        <img src="/img/ability.jpg" alt="Ability" className="battleScreenBottomButtonImage" />
      </button>
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction('defend')}
        disabled={disabled}
      >
        <img src="/img/shield.png" alt="Shield" className="battleScreenBottomButtonImage" />
      </button>
      <div className="shield-uses"></div>
    </div>
  );
};

