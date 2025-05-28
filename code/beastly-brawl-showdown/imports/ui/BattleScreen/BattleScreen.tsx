import React, { useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { io, Socket } from 'socket.io-client';
import MysticWyvern from '/imports/data/monsters/MysticWyvern';

const socket: Socket = io(); // Defaults to current host (adjust if needed)


export const BattleScreen: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState<boolean>(false);

  // Dummy example monsters and playerIds
  const player1Monster = new MysticWyvern;
  const player2Monster = new MysticWyvern;
  const playerId1 = 'player1-id';
  const playerId2 = 'player2-id';

  const triggerAnimation = (): void => {
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  // Emit action through socket and trigger animation
  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    console.log(`Player chose action: ${action}`);

    // Emit the action over socket with payload (like player id)
    socket.emit('playerAction', {
      playerId: playerId1, // or current player id
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
        playerId1={playerId1}
        playerId2={playerId2}
      />
      <BattleBottom onAction={handleAction} />
    </div>
  );
};
