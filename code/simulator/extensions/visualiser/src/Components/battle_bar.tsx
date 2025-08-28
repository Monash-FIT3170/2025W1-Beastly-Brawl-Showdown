import React from "react";

interface BattleBarProps {
//the actual turn number, so array index +1 
  turnInput: number;
//the function passed in to allow it to interact with other componnents
  setTurnInput: (val: number) => void;
  maxTurns: number;
}

const BattleBar: React.FC<BattleBarProps> = ({
  turnInput,
  setTurnInput,
  maxTurns,
}) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <label htmlFor="turn">Turn:</label>
      <input
        type="range"
        id="turn"
        min={0}
        max={Math.max(0, maxTurns - 1)}
        value={turnInput}
        onChange={(e) => setTurnInput(parseInt(e.target.value, 10))}
        style={{ width: "300px", margin: "0 10px" }}
      />
      <span>
        {turnInput + 1} / {maxTurns}
      </span>
    </div>
  );
};

export default BattleBar;
