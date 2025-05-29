import React, { useState, useEffect } from 'react';
import { BattleMonster } from './BattleMonster';
import Monsters from '/imports/data/monsters/Monsters';


// Define the props type
type BattleMiddleProps = {
  showAnimation: boolean;
  player1Monster: Monsters;
  player2Monster: Monsters;
  playerId1: string;
  playerId2: string;
};


//takes a boolean when initialized
export const BattleMiddle: React.FC<BattleMiddleProps> = ({
  showAnimation,
  player1Monster,
  player2Monster,
  playerId1,
  playerId2,
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
      const totalSteps = rollDuration / intervalSpeed; //get the ammount of times it gets swaped out

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
    <div className="battleMiddle">
      <BattleMonster
        image={player1Monster.image}
        alt={player1Monster.type}
        position="monster1"
        playerId={playerId1}
        initialHp={player1Monster.health}
        
      />

      {showAnimation && (
        <div className="diceAnimation">
          <img src="/img/d20.png" alt="Rolling animation" className="diceAnimation" />
          <span className="diceResult">{displayedNumber}</span>
        </div>
      )}

      <BattleMonster
        image={player2Monster.image}
        alt={player2Monster.type}
        position="monster2"
        playerId={playerId2}
        initialHp={player2Monster.health}
      />
    </div>
  );

};
