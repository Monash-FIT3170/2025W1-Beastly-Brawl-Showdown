import React from "react";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import { SideId } from "/imports/simulator/core/side";

type BattleBottomProps = {
  onAction: (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    targetSide: SideId
  ) => void;
  disabled?: boolean;
  myMonsterMoves: { attack: EntryID; ability?: EntryID; defend: EntryID };
};

export const BattleBottom: React.FC<BattleBottomProps> = ({
  onAction,
  disabled,
  myMonsterMoves,
}) => {
  return (
    <div className="battleScreenBottom">
      <button
        className="glb-btn"
        onClick={() =>
          onAction(
            myMonsterMoves.attack,
            "single-enemy" as TargetingMethod,
            1 as SideId
          )
        }
        disabled={disabled}
      >
        <img
          src="/img/sword3.png"
          alt="Sword"
          className="battleScreenBottomButtonImage"
        />
      </button>
      {myMonsterMoves.ability && (
        <button
          className="glb-btn"
          onClick={() =>
            onAction(
              myMonsterMoves.ability!,
              "single-enemy" as TargetingMethod,
              1 as SideId
            )
          }
          disabled={disabled}
        >
          <img
            src="/img/ability2.png"
            alt="Ability"
            className="battleScreenBottomButtonImage"
          />
        </button>
      )}
      <button
        className="glb-btn"
        onClick={() =>
          onAction(
            myMonsterMoves.defend,
            "self" as TargetingMethod,
            0 as SideId
          )
        }
        disabled={disabled}
      >
        <img
          src="/img/shield2.png"
          alt="Shield"
          className="battleScreenBottomButtonImage"
        />
      </button>
      <div className="shield-uses"></div>
    </div>
  );
};
