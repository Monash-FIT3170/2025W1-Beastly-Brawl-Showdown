import React from "react";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import { COMMON_MOVE_POOL } from "../../../../simulator/data/common/common_move_pool";

type Button = {
  id: string;
  icon: string;
}

type MoveButton = Button & {
  id: EntryID;
  targetMethod: TargetingMethod;
};

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod) => void;
  disabled?: boolean;
  onRoll: () => void;
  mode: "combat" | "roll";
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
  onRoll,
  mode,
}: BattleBottomProps) => {

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

  //added a button that isn't tied to the monsters actions
  const buildNormalButton = (id: string, fallbackIcon: string) => {
    return {
      id: id,
      icon: fallbackIcon,
    } as Button;
  };

  // Build button configs dynamically
  const attackBtn = buildButton(myMonsterMoves.attack, "assets/battle-icons/sword3.png");
  const defendBtn = buildButton(myMonsterMoves.defend, "assets/battle-icons/shield2.png");
  const abilityBtn = myMonsterMoves.ability
    ? buildButton(
      myMonsterMoves.ability,
      "assets/img/ability2.png"
    )
    : null;
  const rollBtn = buildNormalButton("roll","/assets/img/d20.png")

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

    const renderButtonForRoll = (btn: Button) => (
    <button
      key={btn.id}
      className="glb-btn"
      onClick={() => onRoll()}
    >
      <img src={btn.icon} alt={btn.id} className="battleScreenBottomButtonImage" />
    </button>
  );

  return (
<div className="battleScreenBottom">
  {mode === "roll" ? (
    renderButtonForRoll(rollBtn)
  ) : (
    <>
      {renderButton(attackBtn)}
      {abilityBtn && renderButton(abilityBtn)}
      {renderButton(defendBtn)}
      {/* <div className="shield-uses"></div> */}
    </div>
  );
};
