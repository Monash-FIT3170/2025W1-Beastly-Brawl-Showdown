import React, { useEffect, useState } from 'react';
import { MonsterTemplate } from '../../simulator/core/monster/monster_template';
import { usePlayerSocket } from '../player/game/PlayerPage';

type BattleMonsterProps = {
  template: MonsterTemplate;
  currentHp: number;
  playerId: string;
  position: string;
};

export const BattleMonster: React.FC<BattleMonsterProps> = ({ template, currentHp, playerId, position }) => {
  const { socket } = usePlayerSocket();
  const [hp, setHp] = useState<number>(100);

  useEffect(() => {
    setHp(currentHp);
  }, [currentHp]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ playerId: targetId, newHp }: { playerId: string; newHp: number }) => {
      if (targetId === playerId) setHp(newHp);
    };

    socket.on('update-hp', handler);

    // ✅ Cleanup function
    return () => {
      socket.off('update-hp', handler);
    };
  }, [socket, playerId]);

  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max={template.baseStats.health} className="hpBar" />
        <span className="hpLabel">{hp} HP</span>
      </div>
      <img className="battleMonsterImg" src={template.imageUrl} alt={template.name} />
    </div>
  );
};