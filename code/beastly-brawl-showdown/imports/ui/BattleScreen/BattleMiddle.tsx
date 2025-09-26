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
