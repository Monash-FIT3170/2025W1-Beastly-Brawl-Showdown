import React from "react";
import type { ChooseMove } from "../../../../core/notice/notice"
import type { EntryID } from "./utils/utils";
import { COMMON_MOVE_NAMES, COMMON_MOVE_POOL } from "../../../../data/common/common_move_pool"

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
        minHeight: "200px",
        position: "absolute",
        bottom:"0px",
      }}
    >
      {chooseMove.data.moveIdOptions.map((moveId) => {
        const action = COMMON_MOVE_POOL[moveId as COMMON_MOVE_NAMES];
        if (!action) {
          console.error(`Invalid action ID (${moveId})`);
          return;
        }
        return (
          <img
            key={moveId}
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
