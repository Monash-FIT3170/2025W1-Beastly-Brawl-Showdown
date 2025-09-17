import React from "react";

type MonsterTooltipProps = {
  currentHealth: number;
  maxHealth: number;
  monsterName: string;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
  abilityName?: string;
};

const MonsterTooltip: React.FC<MonsterTooltipProps> = ({
  currentHealth,
  maxHealth,
  monsterName,
  baseStats,
  abilityName = "No Special Ability",
}) => {
  const percent = Math.max(0, Math.min(1, currentHealth / maxHealth));

  const healthClass =
    percent >= 0.7
      ? "health-green"
      : percent >= 0.4
      ? "health-yellow"
      : "health-red";

  return (
    <div className="health-tooltip">
      <div className="tooltip-content">
        <div className="monster-tooltip-name">{monsterName}</div>

        <span className="health-text">
          {Math.max(0, currentHealth)} / {maxHealth} HP
        </span>
        <div className="tooltip-health-bar">
          <div
            className={`tooltip-health-fill ${healthClass}`}
            style={{ width: `${percent * 100}%` }}
          />
        </div>

        <div className="base-stats">
          <div className="stats-title">Base Stats:</div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">ATK:</span>
              <span className="stat-value">{baseStats.attack}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">DEF:</span>
              <span className="stat-value">{baseStats.defense}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">SPD:</span>
              <span className="stat-value">{baseStats.speed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">HP:</span>
              <span className="stat-value">{baseStats.health}</span>
            </div>
          </div>
        </div>

        <div className="ability-info">
          <div className="ability-name">{abilityName}</div>
        </div>
      </div>
    </div>
  );
};

export default MonsterTooltip;
