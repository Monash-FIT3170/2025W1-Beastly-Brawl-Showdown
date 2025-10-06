import React from "react";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import { COMMON_MOVE_POOL } from "../../../../simulator/data/common/common_move_pool";

type MoveButton = {
  id: EntryID;
  icon: string;
  targetMethod: TargetingMethod;
};

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod) => void;
  disabled?: boolean;
  myMonsterMoves: {
    attack: EntryID;
    ability?: EntryID;
    defend: EntryID;
  };
};

export const BattleBottom: React.FC<BattleBottomProps> = ({
  onAction,
  disabled,
  myMonsterMoves,
}) => {

  const getMove = (moveId: EntryID) => {
    return (COMMON_MOVE_POOL as Record<string, typeof COMMON_MOVE_POOL[keyof typeof COMMON_MOVE_POOL]>)[moveId];
  };

  const buildButton = (moveId: EntryID, fallbackIcon: string) => {
    return {
      id: moveId,
      icon: fallbackIcon,
      targetMethod: getMove(moveId)?.targetingMethod ?? "self"
    } as MoveButton;
  };

  // Build button configs dynamically
  const attackBtn = buildButton(myMonsterMoves.attack, "assets/img/sword3.png");
  const defendBtn = buildButton(myMonsterMoves.defend, "assets/img/shield2.png");
  const abilityBtn = myMonsterMoves.ability
    ? buildButton(
      myMonsterMoves.ability,
      "assets/img/ability2.png"
    )
    : null;

  const renderButton = (btn: MoveButton) => (
    <button
      key={btn.id}
      className="glb-btn"
      onClick={() => onAction(btn.id, btn.targetMethod)}
      disabled={disabled}
    >
      <img src={btn.icon} className="battleScreenBottomButtonImage" />
    </button>
  );

  return (
    <div className="battleScreenBottom">
      {renderButton(attackBtn)}
      {abilityBtn && renderButton(abilityBtn)}
      {renderButton(defendBtn)}
      {/* <div className="shield-uses"></div> */}
    </div>
  );
};
