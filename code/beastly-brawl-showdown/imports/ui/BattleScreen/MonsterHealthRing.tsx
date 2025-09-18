import React from "react";
import SlashAnimation from "./SlashAnimation";
import ShieldAnimation from "./ShieldAnimation";
import AbilityAnimation from "./AbilityAnimation";

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
}) => {
  const size = 200; // circle diameter
  const stroke = 20; // thickness of ring (approximate 8-10% of size)
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = Math.max(0, Math.min(1, currentHealth / maxHealth));
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="health-ring-container">
      <svg className="health-ring" width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <img src={imageSrc} alt="monster" className="monster-img" />
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
