import React from "react";

interface ShieldAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const ShieldAnimation: React.FC<ShieldAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`shield-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="assets/battle-icons/shield_animation.png"
        alt="shield"
        className="shield-image"
      />
    </div>
  );
};

export default ShieldAnimation;
