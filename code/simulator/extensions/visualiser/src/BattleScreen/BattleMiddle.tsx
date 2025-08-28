import React, { useState, useEffect } from "react";
import MonsterHealthRing from "./MonsterHealthRing";

// Define the props type
type BattleMiddleProps = {
  showAnimation: boolean;
  enemyHp: number;
  playerHp: number;
};
//takes a boolean when initialized
export const BattleMiddle: React.FC<BattleMiddleProps> = ({
  showAnimation,
  enemyHp,
  playerHp,
}) => {
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(null);

  //if the showwanimation is true then show thtet animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (showAnimation) {
      let i = 0;
      const rollDuration = 1000; // total roll duration in ms
      const intervalSpeed = 100; // time between number updates

      const finalResult = 20; // eventually will replace with dice roll utility
      const totalSteps = rollDuration / intervalSpeed; //ge the ammount of times it gets swaped out

      interval = setInterval(() => {
        if (i < totalSteps) {
          setDisplayedNumber(Math.floor(Math.random() * 20) + 1); // roll 1-20
          i++;
        } else {
          clearInterval(interval);
          setDisplayedNumber(finalResult);

          timeout = setTimeout(() => {
            console.log("Final result displayed for 3 seconds");
          }, 3000);
        }
      }, intervalSpeed);
    }

    // Clean up interval and timeout
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showAnimation]);

  // const attackAnimation = () => {
  //   // Placeholder for future animation logic
  //   console.log("Attack");
  // };

  return (
    <div className="arena stage-bg">
      {/* Enemy (top portrait) */}
      <div className="portrait portrait--top">
        <MonsterHealthRing
          currentHealth={enemyHp}
          maxHealth={100}
          imageSrc="/img/dragon.png"
        />
      </div>

      {showAnimation && (
        <div className="diceAnimation">
          <img
            src="/img/d20.png"
            alt="Rolling animation"
            className="diceAnimation"
          />
          <span className="diceResult">{displayedNumber}</span>
        </div>
      )}

      {/* Player (bottom portrait) */}
      <div className="portrait portrait--bottom">
        <MonsterHealthRing
          currentHealth={playerHp}
          maxHealth={100}
          imageSrc="/img/wolfman.png"
        />
      </div>
    </div>
  );
};
