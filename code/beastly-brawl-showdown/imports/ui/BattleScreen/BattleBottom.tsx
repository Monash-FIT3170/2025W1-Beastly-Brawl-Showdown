import React from "react";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import { SideId } from "/imports/simulator/core/side";
import { COMMON_MOVE_POOL } from "/imports/simulator/data/common/common_move_pool";

type Button = {
  id: string;
  icon: string;
}

type MoveButton = Button & {
  id: EntryID;
  targetMethod: TargetingMethod;
  targetSide: SideId;
};

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId) => void;
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

  //added a button that isn't tied to the monsters actions
  const buildNormalButton = (id: string, fallbackIcon: string) => {
    return {
      id: id,
      icon: fallbackIcon,
    } as Button;
  };

  // Build button configs dynamically
  const attackBtn = buildButton(myMonsterMoves.attack, "/img/sword3.png");
  const defendBtn = buildButton(myMonsterMoves.defend, "/img/shield2.png");
  const abilityBtn = myMonsterMoves.ability
    ? buildButton(
      myMonsterMoves.ability,
      "/img/ability2.png"
    )
    : null;
  const rollBtn = buildNormalButton("roll","/img/monster-image/miku.jpg")

  const renderButton = (btn: MoveButton) => (
    <button
      key={btn.id}
      className="glb-btn"
      onClick={() => onAction(btn.id, btn.targetMethod, btn.targetSide)}
      disabled={disabled}
    >
      <img src={btn.icon} alt={btn.id} className="battleScreenBottomButtonImage" />
    </button>
  );

    const renderButtonForRoll = (btn: Button) => (
    <button
      key={btn.id}
      className="glb-btn"
      onClick={() => onRoll()}
      disabled={disabled}
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
    </>
  )}
</div>
  );
};
