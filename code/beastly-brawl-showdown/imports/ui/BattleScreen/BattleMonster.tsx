import React, { useEffect, useState } from 'react';
import Monsters from '/imports/data/monsters/Monsters';
import { usePlayerSocket } from '../player/game/PlayerPage';

type BattleMonsterProps = {
  monster: Monsters;
  position: string; // "monster1" or "monster2"
};


export const BattleMonster: React.FC<BattleMonsterProps> = ({ monster, position }) => {
  const { socket } = usePlayerSocket();
  const [hp, setHp] = useState<number>(monster.currentHealth);
  const maxHp = monster.baseHealth;

  useEffect(() => {
    if (!socket) return;

    const handleUpdateHp = ({ playerId, newHp }: { playerId: string; newHp: number }) => {
      if (playerId === monster.monsterName) {
        setHp(newHp);
      }
    };

    socket.on('update-hp', handleUpdateHp);

    return () => {
      socket.off('update-hp', handleUpdateHp);
    };
  }, [socket, monster.monsterName]);

  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max={maxHp} className="hpBar" />
        <span className="hpLabel">{hp} / {maxHp} HP</span>
      </div>
      <img className="battleMonsterImg" src={monster.imageUrl} alt={monster.monsterName} />
    </div>
  );
};
