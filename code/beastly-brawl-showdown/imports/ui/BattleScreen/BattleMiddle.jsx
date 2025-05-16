import React, { useState, useEffect } from 'react';
import { BattleMonster } from './BattleMonster.jsx';

const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

//the middle of thte battle screen, should later contain logic to fetch the monsters to dynamically get their images
export const BattleMiddle = ({showAnimation}) => {
  const [displayedNumber, setDisplayedNumber] = useState(null);

  useEffect(() => {
    let interval;
    if (showAnimation) {
      let i = 0;
      const rollDuration = 1000; // how long it rolls for
      const intervalSpeed = 100; // how fast numbers cycle

      const finalResult = 20; //testt final result, replace with the dice roll functtion from utils later, but can'tt really import for some reason?
      const totalSteps = rollDuration / intervalSpeed;

      interval = setInterval(() => {
        if (i < totalSteps) {
          setDisplayedNumber((Math.floor(Math.random() * 20) + 1)); //randomize numbers from 1-20
          i++;
        } else {
          clearInterval(interval); //
          setDisplayedNumber(finalResult);
          timeout = setTimeout(() => {
            console.log("Final result displayed for 3 second");
          }, 3000);
        }
      }, intervalSpeed);
    }
    return () => clearInterval(interval);
  }, [showAnimation]);


  const attackAnimation = () => {
    // TODO: add attack animation logic here
    console.log("Attack");
  };
  
  return (
    <div className="battleMiddle">
      <BattleMonster image="/img/dragon.png" alt="Monster 1"  position={"monster1"}/>
        {showAnimation && 
        <div className = "diceAnimation">
        <img src="/img/d20.png" alt="Rolling animation" className="diceAnimation" />
        <span className = "diceResult">{displayedNumber}</span>
        </div>
        } 
      <BattleMonster image="/img/wolfman.png" alt="Monster 2" position={"monster2"}/>
    </div>
  );
};
//<BattleMonster image="/img/superminion.png" alt="Monster 2" position={"monster2"}/> this is for putting thet superminion, literally just replace the image part of the Battlemonster lmao