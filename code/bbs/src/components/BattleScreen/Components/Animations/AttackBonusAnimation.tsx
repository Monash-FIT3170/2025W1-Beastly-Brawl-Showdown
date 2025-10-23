import React from "react";

interface AttackBonusAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const AttackBonusAnimation: React.FC<AttackBonusAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`attack-bonus-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="/assets/battle-icons/attack-bonus.png"
        alt="ability"
        className="attack-bonus-image"
      />
    </div>
  );
};

export default AttackBonusAnimation;
