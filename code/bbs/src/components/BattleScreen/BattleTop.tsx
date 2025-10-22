import React from "react";

interface BattleTopProps {
  onSurrender: () => void; // callback from BattleScreen
}

export const BattleTop: React.FC<BattleTopProps> = ({ onSurrender }) => {
  const handleClick = () => {
    console.log("=== [BATTLE TOP] SURRENDER BUTTON CLICKED ===");
    if (!onSurrender) {
      console.warn("[BATTLE TOP] onSurrender callback is missing!");
      return;
    }
    console.log("[BATTLE TOP] Calling BattleScreen's handleSurrender...");
    onSurrender(); // trigger parent handler
  };

  return (
    <div id="battleScreenTop-container">
      <button
        onClick={handleClick}
        className="glb-btn"
        id="battleScreenTop-btn"
      >
        Surrender
      </button>
    </div>
  );
};
