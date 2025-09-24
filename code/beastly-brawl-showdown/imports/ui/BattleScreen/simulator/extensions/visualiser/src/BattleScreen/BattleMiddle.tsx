import React, { useState, useEffect } from "react";
import MonsterHealthRing from "./MonsterHealthRing";

// Define the props type
type BattleMiddleProps = {
  //showAnimation: boolean;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  enemyImgSrc: string;
  playerImgSrc: string;
  showAnimation: boolean;
  enemySlashVisible: boolean;
  onEnemySlashComplete: () => void;
  playerSlashVisible: boolean;
  onPlayerSlashComplete: () => void;
  enemyShieldVisible: boolean;
  onEnemyShieldComplete: () => void;
  playerShieldVisible: boolean;
  onPlayerShieldComplete: () => void;
  enemyAbilityVisible: boolean;
  onEnemyAbilityComplete: () => void;
  playerAbilityVisible: boolean;
  onPlayerAbilityComplete: () => void;
};
//takes a boolean when initialized
export const BattleMiddle: React.FC<BattleMiddleProps> = ({
  //showAnimation,
  enemyHp,
  playerHp,
  enemyImgSrc,
  playerImgSrc,
  enemyMaxHp,
  playerMaxHp,
  showAnimation,
  enemySlashVisible,
  onEnemySlashComplete,
  playerSlashVisible,
  onPlayerSlashComplete,
  enemyShieldVisible,
  onEnemyShieldComplete,
  playerShieldVisible,
  onPlayerShieldComplete,
  enemyAbilityVisible,
  onEnemyAbilityComplete,
  playerAbilityVisible,
  onPlayerAbilityComplete,
}) => {
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(null);

  // //if the showwanimation is true then show thtet animation
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   let timeout: NodeJS.Timeout;

  //   if (showAnimation) {
  //     let i = 0;
  //     const rollDuration = 1000; // total roll duration in ms
  //     const intervalSpeed = 100; // time between number updates

  //     const finalResult = 20; // eventually will replace with dice roll utility
  //     const totalSteps = rollDuration / intervalSpeed; //ge the ammount of times it gets swaped out

  //     interval = setInterval(() => {
  //       if (i < totalSteps) {
  //         setDisplayedNumber(Math.floor(Math.random() * 20) + 1); // roll 1-20
  //         i++;
  //       } else {
  //         clearInterval(interval);
  //         setDisplayedNumber(finalResult);

  //         timeout = setTimeout(() => {
  //           console.log("Final result displayed for 3 seconds");
  //         }, 3000);
  //       }
  //     }, intervalSpeed);
  //   }

  //   // Clean up interval and timeout
  //   return () => {
  //     clearInterval(interval);
  //     clearTimeout(timeout);
  //   };
  // }, [showAnimation]);

  // const attackAnimation = () => {
  //   // Placeholder for future animation logic
  //   console.log("Attack");
  // };

  return (
    <div className="combat-arena">
      <MonsterHealthRing
        currentHealth={enemyHp}
        maxHealth={enemyMaxHp}
        imageSrc={enemyImgSrc}
        showSlash={enemySlashVisible}
        onSlashComplete={onEnemySlashComplete}
        showShield={enemyShieldVisible}
        onShieldComplete={onEnemyShieldComplete}
        showAbility={enemyAbilityVisible}
        onAbilityComplete={onEnemyAbilityComplete}
      />
      <MonsterHealthRing
        currentHealth={playerHp}
        maxHealth={playerMaxHp}
        imageSrc={playerImgSrc}
        showSlash={playerSlashVisible}
        onSlashComplete={onPlayerSlashComplete}
        showShield={playerShieldVisible}
        onShieldComplete={onPlayerShieldComplete}
        showAbility={playerAbilityVisible}
        onAbilityComplete={onPlayerAbilityComplete}
      />
    </div>
  );
};
