import React from "react";

type BattleBottomProps = {
  onAction: (moveId: number, targetSide: number) => void;
  disabled?: boolean;
  myMonsterMoves: { attack: number; defend: number; ability?: number }; // pass move IDs from parent
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onAction, disabled, myMonsterMoves }) => {
  return (
    <div className="battleScreenBottom">
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction(myMonsterMoves.attack, 1)}
        disabled={disabled}
      >
        <img src="/img/sword.png" alt="Sword" className="battleScreenBottomButtonImage" />
      </button>
      {myMonsterMoves.ability && (
        <button
          className="battleScreenBottomButton"
          onClick={() => onAction(myMonsterMoves.ability!, 1)}
          disabled={disabled}
        >
          <img src="/img/ability.jpg" alt="Ability" className="battleScreenBottomButtonImage" />
        </button>
      )}
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction(myMonsterMoves.defend, 0)}
        disabled={disabled}
      >
        <img src="/img/shield.png" alt="Shield" className="battleScreenBottomButtonImage" />
      </button>
      <div className="shield-uses"></div>
    </div>
  );
};
