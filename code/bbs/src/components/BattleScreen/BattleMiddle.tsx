import React, { useState, useEffect } from "react";
import MonsterHealthRing from "./MonsterHealthRing";

type BaseStats = {
  attack: number;
  defense: number;
};

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
  enemyMonsterName: string;
  enemyBaseStats: BaseStats;
  playerMonsterName: string;
  playerBaseStats: BaseStats;
  enemyAbilityName?: string;
  playerAbilityName?: string;
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
  enemyMonsterName,
  enemyBaseStats,
  playerMonsterName,
  playerBaseStats,
  enemyAbilityName,
  playerAbilityName,
}) => {
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
        monsterName={enemyMonsterName}
        baseStats={enemyBaseStats}
        abilityName={enemyAbilityName}
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
        monsterName={playerMonsterName}
        baseStats={playerBaseStats}
        abilityName={playerAbilityName}
      />
    </div>
  );
};
