import React from "react";

type BattleBottomProps = {
  onAttack: () => void;
  onAbility: () => void;
  onDefend: () => void;
};

export const BattleBottom: React.FC<BattleBottomProps> = ({
  onAttack,
  onAbility,
  onDefend,
}) => {
  // const handleRoll = () => {
  //   onRoll();
  //   //basically just clals whatever function is given to this as a parameter
  // };
  return (
    <div className="battleScreenBottom">
      <button className="glb-btn" onClick={onAttack}>
        <img
          className="battleScreenBottomButtonImage"
          src="/img/sword3.png"
          alt="Sword"
        />
      </button>
      <button className="glb-btn" onClick={onAbility}>
        <img
          className="battleScreenBottomButtonImage"
          src="/img/ability2.png"
          alt="Ability"
        />
      </button>
      <button className="glb-btn" onClick={onDefend}>
        <img
          className="battleScreenBottomButtonImage"
          src="/img/shield2.png"
          alt="Shield"
        />
      </button>
    </div>
  );
};
