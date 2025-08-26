import React from "react";
import type { ChooseMove } from "@sim/core/notice/notice";
import type { EntryID } from "@sim/core/types";
import { commonMovePool } from "@sim/data/common/common_move_pool";

interface BattleControlsProps {
  chooseMove: ChooseMove;
  onSelectedMoveId: (moveId: EntryID) => void;
}

const BattleControls: React.FC<BattleControlsProps> = ({ chooseMove, onSelectedMoveId }) => {
  return (
    <div
      style={{
        backgroundColor: "cornflowerblue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {chooseMove.data.moveIdOptions.map((moveId) => {
        const action = commonMovePool[moveId];
        if (!action) {
          console.error(`Invalid action ID (${moveId})`);
          return;
        }
        return (
          <img
            src={`src/assets/${action.icon}`}
            onClick={() => onSelectedMoveId(moveId)}
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        );
      })}
    </div>
  );
};

export default BattleControls;
