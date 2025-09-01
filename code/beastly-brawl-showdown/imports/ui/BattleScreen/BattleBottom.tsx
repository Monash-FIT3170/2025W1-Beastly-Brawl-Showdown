import React from "react";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import { SideId } from "/imports/simulator/core/side";
import { COMMON_MOVE_POOL } from "/imports/simulator/data/common/common_move_pool";

type MoveButton = {
  id: EntryID;
  icon: string;
  targetMethod: TargetingMethod;
  targetSide: SideId;
};

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId) => void;
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

  const buildButton = (moveId: EntryID, fallbackIcon: string, targetSide: SideId) => {
    return {
      id: moveId,
      icon: fallbackIcon,
      targetMethod: getMove(moveId)?.targetingMethod ?? "self",
      targetSide,
    } as MoveButton;
  };

  // Build button configs dynamically
  const attackBtn = buildButton(myMonsterMoves.attack, "/img/sword3.png", 1 as SideId);
  const defendBtn = buildButton(myMonsterMoves.defend, "/img/shield2.png", 0 as SideId);
  const abilityBtn = myMonsterMoves.ability
    ? buildButton(
      myMonsterMoves.ability,
      "/img/ability2.png",
      getMove(myMonsterMoves.ability)?.targetingMethod === "self" ? 0 as SideId : 1 as SideId
    )
    : null;

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

  return (
    <div className="battleScreenBottom">
      {renderButton(attackBtn)}
      {abilityBtn && renderButton(abilityBtn)}
      {renderButton(defendBtn)}
      <div className="shield-uses"></div>
    </div>
  );
};
