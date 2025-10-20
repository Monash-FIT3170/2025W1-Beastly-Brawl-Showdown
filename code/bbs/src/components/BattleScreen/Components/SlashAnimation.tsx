import React from "react";

interface SlashAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const SlashAnimation: React.FC<SlashAnimationProps> = ({
  isVisible,
  onComplete,
}) => {
  return (
    <div
      className={`slash-animation ${isVisible ? "active" : ""}`}
      onAnimationEnd={onComplete}
    >
      <img src="assets/battle-icons/slash.png" alt="slash" className="slash-image" />
    </div>
  );
};

export default SlashAnimation;
