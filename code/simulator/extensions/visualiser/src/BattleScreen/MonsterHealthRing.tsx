import React from "react";

type Props = {
  currentHealth: number;
  maxHealth: number;
  imageSrc?: string;
};

const MonsterHealthRing: React.FC<Props> = ({
  currentHealth,
  maxHealth,
  imageSrc,
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
    </div>
  );
};

export default MonsterHealthRing;
