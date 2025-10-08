import React from "react";

interface AbilityAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const AbilityAnimation: React.FC<AbilityAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`ability-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="/battle-icons/ability_animation.png"
        alt="ability"
        className="ability-image"
      />
    </div>
  );
};

export default AbilityAnimation;
