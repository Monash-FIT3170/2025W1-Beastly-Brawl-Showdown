import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(); // Defaults to current host

type BattleMonsterProps = {
  image: string;
  alt: string;
  position: string; // "monster1" or "monster2"
  playerId: string; // Who is this monster controlled by
  initialHp: number; // pass initial HP here

};

export const BattleMonster: React.FC<BattleMonsterProps> = ({ image, alt, position, playerId }) => {
  const [hp, setHp] = useState<number>(100);

  useEffect(() => {
    // Update HP when server sends new value
    socket.on('update-hp', ({ playerId: targetId, newHp }) => {
      if (targetId === playerId) {
        setHp(newHp);
      }
    });

    return () => {
      socket.off('update-hp');
    };
  }, [playerId]);

  return (
    <div className={position}>
      <div className="progressContainer">
        <progress value={hp} max={100} className="hpBar"></progress>
        <span className="hpLabel">{hp} HP</span>
      </div>
      <img className="battleMonsterImg" src={image} alt={alt} />
    </div>
  );

  //Server side io.emit('update-hp', { playerId: damagedPlayerId, newHp: updatedHp });
};
