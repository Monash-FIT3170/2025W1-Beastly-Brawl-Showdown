import React from "react";
import { useNavigate } from "react-router";

interface BattleTopProps {
  turnNumber: number;
  playerName: string;
  opponentName: string;
}

export const BattleTop: React.FC<BattleTopProps> = ({
  turnNumber,
  // playerName,
  opponentName,
}) => {
  const navigate = useNavigate();

  return (
    <div className="battle-top-bar">
      {/* Left side: Turn number */}
      <div className="battle-top-left">
        <span className="turn-label">Turn</span>
        <span className="turn-label">{turnNumber}</span>
      </div>

      {/* <div style={{flex: 1}}></div> */}

      {/* Center: Player vs Opponent */}
      <div className="battle-top-center">
        <span>VS</span>
        <span className="opponent-name">{opponentName}</span>
      </div>

      {/* <div style={{flex: 1}}></div> */}

      {/* Right side: Surrender */}
      <div className="battle-top-right">
        <button
          onClick={() => navigate("/main")}
          className="surrender-btn"
        >
          &#x21A9;
        </button>
      </div>
    </div>
  );
};
