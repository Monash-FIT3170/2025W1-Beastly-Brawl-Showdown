import React from "react";

interface DoubleAttackAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const DoubleAttackAnimationProps: React.FC<DoubleAttackAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`double-attack-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="assets/battle-icons/double-attack_animation.png"
        alt="ability"
        className="double-attack-image"
      />
    </div>
  );
};

export default DoubleAttackAnimationProps;
