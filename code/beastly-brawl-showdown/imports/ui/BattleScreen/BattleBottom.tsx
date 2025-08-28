import React from "react";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import { SideId } from "/imports/simulator/core/side";

type BattleBottomProps = {
  onAction: (moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId ) => void;
  disabled?: boolean;
  myMonsterMoves: { attack: EntryID; defend: EntryID; ability?: EntryID };
};

export const BattleBottom: React.FC<BattleBottomProps> = ({ onAction, disabled, myMonsterMoves }) => {
  return (
    <div className="battleScreenBottom">
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction(myMonsterMoves.attack, "single-enemy" as TargetingMethod, 1 as SideId)}
        disabled={disabled}
      >
        <img src="/img/sword.png" alt="Sword" className="battleScreenBottomButtonImage" />
      </button>
      {myMonsterMoves.ability && (
        <button
          className="battleScreenBottomButton"
          onClick={() => onAction(myMonsterMoves.ability!, "single-enemy" as TargetingMethod, 1 as SideId)}
          disabled={disabled}
        >
          <img src="/img/ability.jpg" alt="Ability" className="battleScreenBottomButtonImage" />
        </button>
      )}
      <button
        className="battleScreenBottomButton"
        onClick={() => onAction(myMonsterMoves.defend, "self" as TargetingMethod, 0 as SideId)}
        disabled={disabled}
      >
        <img src="/img/shield.png" alt="Shield" className="battleScreenBottomButtonImage" />
      </button>
      <div className="shield-uses"></div>
    </div>
  );
};
