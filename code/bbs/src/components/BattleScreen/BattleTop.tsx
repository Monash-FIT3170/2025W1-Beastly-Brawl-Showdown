import React from "react";
import { useNavigate } from "react-router";

interface BattleTopProps {
  turnNumber: number;
  playerName: string;
  opponentName: string;
}

export const BattleTop: React.FC<BattleTopProps> = ({
  turnNumber,
  playerName,
  opponentName,
}) => {
  const navigate = useNavigate();

  return (
    <div className="battle-top-bar">
      {/* Left side: Turn number */}
      <div className="battle-top-left">
        <span className="turn-label">Turn {turnNumber}</span>
      </div>

      {/* Center: Player vs Opponent */}
      <div className="battle-top-center">
        <span className="player-name">{playerName}</span>
        &nbsp;<span className="vs-text">VS</span>&nbsp;
        <span className="opponent-name">{opponentName}</span>
      </div>

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
