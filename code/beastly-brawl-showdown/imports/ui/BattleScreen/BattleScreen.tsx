import React from 'react';
import { io, Socket } from 'socket.io-client';
import { monsterData, MonsterName } from '../../data/monsters/MonsterData';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';

interface BattleScreenProps {
  selectedMonsterName: MonsterName; // Use the typed key
}

const socket: Socket = io();

export const BattleScreen: React.FC<BattleScreenProps> = ({ selectedMonsterName }) => {
  const MonsterData = monsterData[selectedMonsterName]; 
  const player1Monster = new MonsterData();
  const player2Monster = new MonsterData(); // Replace later with actual enemy logic

  const [showAnimation, setShowAnimation] = React.useState(false);

  const triggerAnimation = () => {
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    socket.emit('playerAction', {
      playerId: 'player1-id',
      action,
    });

    triggerAnimation();
  };

  return (
    <div className="battleScreen">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        player1Monster={player1Monster}
        player2Monster={player2Monster}
        playerId1="player1-id"
        playerId2="player2-id"
      />
      <BattleBottom onAction={handleAction} />
    </div>
  );
};
