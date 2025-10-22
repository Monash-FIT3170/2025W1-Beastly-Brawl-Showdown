import React, { useState } from "react";
import SlashAnimation from "./SlashAnimation";
import ShieldAnimation from "./ShieldAnimation";
import AbilityAnimation from "./AbilityAnimation";
import MonsterTooltip from "../../MonsterToolTip";

type BaseStats = {
  attack: number;
  defense: number;
};

type Props = {
  currentHealth: number;
  maxHealth: number;
  imageSrc?: string;
  showSlash?: boolean;
  onSlashComplete?: () => void;
  showShield?: boolean;
  onShieldComplete?: () => void;
  showAbility?: boolean;
  onAbilityComplete?: () => void;
  monsterName: string;
  baseStats: BaseStats;
  abilityName?: string;
};

const MonsterHealthRing: React.FC<Props> = ({
  currentHealth,
  maxHealth,
  imageSrc,
  showSlash = false,
  onSlashComplete,
  showShield = false,
  onShieldComplete,
  showAbility = false,
  onAbilityComplete,
  monsterName,
  baseStats,
  abilityName,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const size = 170; // circle diameter
  const stroke = 17; // thickness of ring (approximate 8-10% of size)
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = Math.max(0, Math.min(1, currentHealth / maxHealth));
  const dashOffset = circumference * (1 - percent);

  const healthClass =
    percent >= 0.7
      ? "health-green"
      : percent >= 0.4
      ? "health-yellow"
      : "health-red";

  return (
    <div
      className="health-ring-container"
      style={
        {
          "--ring-size": `${size}px`,
          "--ring-stroke": `${stroke}px`,
        } as React.CSSProperties
      }
      //desktop uses hover
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      //mobile uses press and hold
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={() => setShowTooltip(false)}
      onTouchCancel={() => setShowTooltip(false)}
    >
      <svg className="health-ring" width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className={`ring-fg ${healthClass}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <img src={imageSrc} alt="monster" className="monster-img" />

      {showTooltip && (
        <MonsterTooltip
          currentHealth={currentHealth}
          maxHealth={maxHealth}
          monsterName={monsterName}
          baseStats={baseStats}
          abilityName={abilityName}
        />
      )}

      <SlashAnimation
        isVisible={showSlash}
        onComplete={onSlashComplete ?? (() => {})}
      />
      <ShieldAnimation
        isVisible={showShield}
        onComplete={onShieldComplete ?? (() => {})}
      />
      <AbilityAnimation
        isVisible={showAbility}
        onComplete={onAbilityComplete ?? (() => {})}
      />
    </div>
  );
};

export default MonsterHealthRing;
