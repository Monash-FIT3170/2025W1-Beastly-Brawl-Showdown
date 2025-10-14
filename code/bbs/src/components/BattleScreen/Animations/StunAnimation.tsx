import React from "react";

interface StunAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const StunAnimation: React.FC<StunAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`stun-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="/battle-icons/stun_animation.png"
        alt="stun"
        className="stun-image"
      />
    </div>
  );
};

export default StunAnimation;
