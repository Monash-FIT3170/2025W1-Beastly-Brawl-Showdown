import React from "react";
import { type EntryID } from "../../../../simulator/core/utils";
import { type TargetingMethod } from "../../../../simulator/core/action/targeting";
import { COMMON_MOVE_POOL } from "../../../../simulator/data/common/common_move_pool";
import type { ChooseMove } from "../../../../simulator/core/notice/notice";

type Button = {
  id: string;
  icon: string;
};

type MoveButton = Button & {
  id: EntryID;
  targetMethod: TargetingMethod;
};

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod) => void;
  disabled?: boolean;
  chooseMove: ChooseMove | null;
  onReroll: (option:boolean) => void;
  rerollMode: boolean;
  fallbackMoves: {
    attack: EntryID;
    ability?: EntryID;
    defend: EntryID;
  };
};

export const BattleBottom: React.FC<BattleBottomProps> = ({
  onAction,
  disabled,
  chooseMove,
  onReroll,
  rerollMode,
  fallbackMoves,
}: BattleBottomProps) => {
  const getMove = (moveId: EntryID) => {
    return (COMMON_MOVE_POOL as Record<
      string,
      (typeof COMMON_MOVE_POOL)[keyof typeof COMMON_MOVE_POOL]
    >)[moveId];
  };

  const buildButton = (moveId: EntryID, fallbackIcon: string) => {
    return {
      id: moveId,
      icon: fallbackIcon,
      targetMethod: getMove(moveId)?.targetingMethod ?? "self",
    } as MoveButton;
  };

  const buildAtkButton = (moveId: EntryID) => {
      return moveId ? buildButton(moveId, "assets/battle-icons/sword3.png"): null;
  };

  const buildDefButton = (moveId: EntryID) => {
      return moveId ? buildButton(moveId, "assets/battle-icons/shield2.png"): null;
  };

  const buildAbilityButton = (moveId: EntryID) => {
      return moveId ? buildButton(moveId, "assets/img/ability2.png"): null;
  };


  // Added a button that isn't tied to the monster's actions
  const buildNormalButton = (id: string, fallbackIcon: string) => {
    return {
      id,
      icon: fallbackIcon,
    } as Button;
  };

  let attackBtn: MoveButton | null = null;
  let defendBtn: MoveButton | null = null;
  let abilityBtn: MoveButton | null = null;
  
  // Build button configs dynamically
  const rerollBtnY = buildNormalButton("rerollY", "/assets/img/d20.png");
  const rerollBtnN = buildNormalButton("rerollN", "/assets/img/d20.png");

  if (chooseMove?.data?.moveIdOptions) {
    for (const move of chooseMove.data.moveIdOptions) {
      switch(getMove(move).moveCat){
        case "attack": {
          attackBtn = buildAtkButton(move);
          break;
        }
        case "defend": {
          defendBtn = buildDefButton(move);
          break;
        }
        case "ability": {
          abilityBtn = buildAbilityButton(move);
          break;
        }
        default:{
          console.log("WHICH DUMB DUMB IS ADDING NEW MOVECATS")
        }
      }
    }
  }
  else {
    if (!disabled){
      console.warn("NO CHOOOSEMOVE HAS BEEN DETECED, GOING BACK TO FALLBACK BUTTONS")
      attackBtn = buildAtkButton(fallbackMoves.attack);
      defendBtn = buildDefButton(fallbackMoves.defend);
      abilityBtn = fallbackMoves.ability ? buildButton(fallbackMoves.ability, "/assets/img/ability2.png") : null;
    }
  }

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

  const renderButtonForReroll = (btn: Button, option:boolean) => (
    <button key={btn.id} className="glb-btn" onClick={() => onReroll(option)}>
      <img src={btn.icon} alt={btn.id} className="battleScreenBottomButtonImage" />
    </button>
  );

  return (
    <div className="battleScreenBottom">
      {rerollMode ? (
        <>
          {renderButtonForReroll(rerollBtnY, true)}
          {renderButtonForReroll(rerollBtnN, false)}
        </>
      ) : (
        <>
          {attackBtn && renderButton(attackBtn)}
          {abilityBtn && renderButton(abilityBtn)}
          {defendBtn && renderButton(defendBtn)}
        </>
      )}
    </div>
  );
}