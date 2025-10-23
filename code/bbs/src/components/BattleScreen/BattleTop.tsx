import React from "react";

interface BattleTopProps {
  turnNumber: number;
  playerName: string;
  opponentName: string;
  onSurrender: () => void;
}

export const BattleTop: React.FC<BattleTopProps> = ({
  turnNumber,
  // playerName,
  opponentName,
}) => {
  const navigate = useNavigate();

export const BattleTop: React.FC<BattleTopProps> = ({ onSurrender }) => {
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
          onClick={onSurrender}
          className="surrender-btn"
        >
          &#x21A9;
        </button>
      </div>
    </div>
  );
};
