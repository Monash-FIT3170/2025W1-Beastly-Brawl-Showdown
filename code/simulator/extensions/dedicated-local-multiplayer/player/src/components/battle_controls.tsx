import React from "react";
import type { ChooseMove } from "@beastly-brawl-showdown/sim-core/notice/notice";
import type { EntryID } from "@beastly-brawl-showdown/sim-core/utils";
import { COMMON_MOVE_NAMES, COMMON_MOVE_POOL } from "@beastly-brawl-showdown/sim-data/common/common_move_pool";

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
        const action = COMMON_MOVE_POOL[moveId as COMMON_MOVE_NAMES];
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
