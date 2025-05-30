import React, { useEffect, useState } from 'react';
import { monsterData, MonsterName } from '../../data/monsters/MonsterData';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';
import Monsters from '/imports/data/monsters/Monsters';

interface BattleScreenProps {
  selectedMonsterName: MonsterName; // Use the typed key
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ selectedMonsterName }) => {
  // #region Variable initialisation
  // Establish connection to existing socket
  const { socket } = usePlayerSocket();

  // Initialise the 2 monsters with the monsterdata class
  const MonsterData = monsterData[selectedMonsterName];
  const player1Monster = new MonsterData();
  const player2Monster = new MonsterData(); // Replace later with actual enemy logic
  const [enemyMonster, setenemyMonsterMonster] = useState<Monsters>();
  const [myMonster, setMyMonsterMonster] = useState<Monsters>(); 

  // #endregion


  // State to trigger animation showing or not
  const [showAnimation, setShowAnimation] = useState(false);

  // #region Socket Methods
  // Socket methods to communicate with server (main.ts) go here
  useEffect(() => {
    // Error checking for null socket
    if (!socket) return;


    const handleMatchStarted = (data: { enemyMonster: Monsters }) => {
      setenemyMonsterMonster(data.enemyMonster);
    };

    socket.on("match-started", handleMatchStarted);

  });
  //#endregion

  //#region 
  const triggerAnimation = () => {
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    if (!socket) return;

    socket.emit('playerAction', {
      playerId: 'player1-id',
      action,
    });

    triggerAnimation();
  };

  // HTML to show each monster and the animations
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
