import React from "react";

interface DodgeAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const DodgeAnimationProps: React.FC<DodgeAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`dodge-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img
        src="/battle-icons/dodge_animation.png"
        alt="ability"
        className="dodge-image"
      />
    </div>
  );
};

export default DodgeAnimationProps;
