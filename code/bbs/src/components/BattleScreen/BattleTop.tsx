import React from "react";
import { useNavigate } from "react-router";

interface BattleTopProps {
  onSurrender: () => void; // new prop
}

export const BattleTop: React.FC<BattleTopProps> = ({ onSurrender }) => {
  return (
    <button
      onClick={onSurrender}
      className="glb-btn"
      id="battleScreenTop-btn"
    >
      Surrender
    </button>
  );
};
