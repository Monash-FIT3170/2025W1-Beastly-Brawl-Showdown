import React, { useEffect, useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';
import Monsters from '/imports/data/monsters/Monsters';

interface BattleScreenProps {
  matchData: {
    myMonster: Monsters;
    enemyMonster: Monsters;
  };
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ matchData }) => {
  // Establish connection to existing socket
  const { socket /*, isConnected*/ } = usePlayerSocket();

  // Establish if a move has been selected
  const [hasSubmittedAction, setHasSubmittedAction] = useState(false);

  // Initialize monsters
  const [myMonster, setMyMonster] = useState<Monsters>();
  const [enemyMonster, setEnemyMonster] = useState<Monsters>();

  // Optional animation flag (can be enhanced later)
  const [showAnimation /*, setShowAnimation*/] = useState(false);

  useEffect(() => {
    setMyMonster(matchData.myMonster);
    setEnemyMonster(matchData.enemyMonster);
  }, [matchData]);

  //Listen for battle-update from server
  useEffect(() => {
    if (!socket) return;

    const handleBattleUpdate = (data: { myMonster: Monsters; enemyMonster: Monsters }) => {
      console.log("Received battle update", data);
      setMyMonster(data.myMonster);
      setEnemyMonster(data.enemyMonster);
      setHasSubmittedAction(false); // Re-enable buttons for next turn
    };

    socket.on("battle-update", handleBattleUpdate);

    return () => {
      socket.off("battle-update", handleBattleUpdate);
    };
  }, [socket]);

  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    if (!socket || hasSubmittedAction) return;

    socket.emit("RequestSubmitMove", {
      playerSocket: socket.id,
      action,
    });

    setHasSubmittedAction(true); // Disable buttons after action
  };

  if (!myMonster || !enemyMonster) {
    return <div>Loading battle...</div>;
  }

  return (
    <div className="battleScreen">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        player1Monster={myMonster}
        player2Monster={enemyMonster}
      />
      <BattleBottom onAction={handleAction} disabled={hasSubmittedAction} />
    </div>
  );
};
