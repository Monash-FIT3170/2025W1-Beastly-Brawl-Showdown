import React, { useEffect, useState } from 'react';
import { BattleMonster } from './BattleMonster';
import { MonsterTemplate } from '../../simulator/core/monster/monster_template';
import MonsterHealthRing from './MonsterHealthRing';

type BattleMiddleProps = {
  showAnimation: boolean;
  player1: { template: MonsterTemplate; currentHp: number; playerId: string };
  player2: { template: MonsterTemplate; currentHp: number; playerId: string };

  enemySlashVisible?: boolean;
  onEnemySlashComplete?: () => void;
  playerSlashVisible?: boolean;
  onPlayerSlashComplete?: () => void;
};

export const BattleMiddle: React.FC<BattleMiddleProps> = ({ showAnimation, player1, player2, enemySlashVisible, onEnemySlashComplete, playerSlashVisible, onPlayerSlashComplete}) => {
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (showAnimation) {
      let i = 0;
      const rollDuration = 1000;
      const intervalSpeed = 100;
      const totalSteps = rollDuration / intervalSpeed;
      const finalResult = 20; // replace with real dice roll later

      interval = setInterval(() => {
        if (i < totalSteps) {
          setDisplayedNumber(Math.floor(Math.random() * 20) + 1);
          i++;
        } else {
          clearInterval(interval);
          setDisplayedNumber(finalResult);

          timeout = setTimeout(() => console.log('Final result shown'), 3000);
        }
      }, intervalSpeed);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showAnimation]);

  return (
    <div className="combat-arena">
      <MonsterHealthRing
        currentHealth={player2.currentHp}
        maxHealth={100}
        imageSrc={player2.template.imageUrl}
        showSlash={enemySlashVisible}
        onSlashComplete={onEnemySlashComplete}
      />
      <MonsterHealthRing
        currentHealth={player1.currentHp}
        maxHealth={100}
        imageSrc={player1.template.imageUrl}
        showSlash={playerSlashVisible}
        onSlashComplete={onPlayerSlashComplete}
      />
    </div>
  );
};
