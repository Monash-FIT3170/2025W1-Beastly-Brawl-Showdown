import React from "react";

interface BattleTopProps {
  turnNumber: number;
  playerName: string;
  opponentName: string;
  onSurrender?: () => void;
}

export const BattleTop: React.FC<BattleTopProps> = ({
  turnNumber,
  playerName,
  opponentName,
  onSurrender
}) => {
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
        {!onSurrender ? (
          <span className="battle-names">
            {playerName} <span >VS</span> {opponentName}
          </span>
        ) : (
          <span>
            VS <span className="opponent-name">{opponentName}</span>
          </span>
        )}
      </div>

      {/* <div style={{flex: 1}}></div> */}

      {/* Right side: Surrender */}
      {onSurrender && ( // only show if defined
        <div className="battle-top-right">
          <button onClick={() => onSurrender?.()} className="surrender-btn">
            &#x21A9;
          </button>
        </div>
      )}
    </div>
  );
};
