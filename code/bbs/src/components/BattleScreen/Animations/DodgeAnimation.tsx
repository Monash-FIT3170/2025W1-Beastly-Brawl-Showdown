import React from "react";

interface DodgeAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const DodgeAnimation: React.FC<DodgeAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`stun-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="/battle-icons/dodge_animation.png"
        alt="dodge"
        className="dodge-image"
      />
    </div>
  );
};

export default DodgeAnimation;
