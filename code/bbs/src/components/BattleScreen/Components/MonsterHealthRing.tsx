import React, { useState } from "react";
import SlashAnimation from "./Animations/SlashAnimation";
import ShieldAnimation from "./Animations/ShieldAnimation";
import AbilityOverlay, { type AbilityKind } from "./Animations/AbilityOverlay";
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
  abilityKind?: AbilityKind | null;
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
  abilityKind = null,
  monsterName,
  baseStats,
  abilityName,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const percent = Math.max(0, Math.min(1, currentHealth / maxHealth));
  // const dashOffset = circumference * (1 - percent);

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
          "--health-percent": percent,
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
      <svg className="health-ring">
        <circle className="ring-bg" />
        <circle className={`ring-fg ${healthClass}`} />
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
      <AbilityOverlay
        kind={abilityKind}
        visible={showAbility}
        onComplete={onAbilityComplete ?? (() => {})}
      />
    </div>
  );
};

export default MonsterHealthRing;
