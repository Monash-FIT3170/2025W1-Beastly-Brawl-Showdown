import React, { useEffect, useRef } from "react";

export const WaitingScreen: React.FC = () => {
  const waitingTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restartAnimation = () => {
      if (waitingTextRef.current) {
        const letters =
          waitingTextRef.current.querySelectorAll(".bounce-letter");
        letters.forEach((letter, index) => {
          const element = letter as HTMLElement;
          element.style.animation = "none";
          requestAnimationFrame(() => {
            element.style.animation = `bounce 0.6s ease-in-out ${
              index * 0.1
            }s both`;
          });
        });
      }
    };

    const initialTimeout = setTimeout(restartAnimation, 100);
    const interval = setInterval(restartAnimation, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="waiting-screen">
      <div className="logo" />
      <div className="waiting-wrapper">
        <div className="waiting-line" />
        <div className="waiting-text" ref={waitingTextRef}>
          <span className="bounce-letter">W</span>
          <span className="bounce-letter">a</span>
          <span className="bounce-letter">i</span>
          <span className="bounce-letter">t</span>
          <span className="bounce-letter">i</span>
          <span className="bounce-letter">n</span>
          <span className="bounce-letter">g</span>
          <span className="bounce-letter">.</span>
          <span className="bounce-letter">.</span>
          <span className="bounce-letter">.</span>
        </div>
        <div className="waiting-line" />
      </div>
    </div>
  );
};

export default WaitingScreen;
