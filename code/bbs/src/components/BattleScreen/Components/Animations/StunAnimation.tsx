import React from "react";

interface StunAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const StunAnimationProps: React.FC<StunAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`stun-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="assets/battle-icons/stun_animation.png"
        alt="ability"
        className="stun-image"
      />
    </div>
  );
};

export default StunAnimationProps;
