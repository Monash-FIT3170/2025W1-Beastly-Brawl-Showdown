import React from "react";

interface BattleTopProps {
  onSurrender: () => void; // callback from BattleScreen
}

export const BattleTop: React.FC<BattleTopProps> = ({ onSurrender }) => {
  return (
    <div id="battleScreenTop-container">
      <button
        onClick={onSurrender}
        className="glb-btn"
        id="battleScreenTop-btn"
      >
        Surrender
      </button>
    </div>
  );
};
