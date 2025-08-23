import React, { useEffect, useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';
import { Monster, MonsterTemplate } from '/imports/simulator/core/monster/monster';

interface BattleScreenProps {
  matchData: {
    myMonster: Monster;
    enemyMonster: Monster;
  };
}

export const BattleScreen: React.FC = () => {

  // #region Variable initialisation
  // Establish connection to existing socket
  const { socket } = usePlayerSocket();

  // Initialise the 2 monsters with the monsterdata class 
  const [myMonster, setMyMonster] = useState<Monster>();
  const [enemyMonster, setEnemyMonster] = useState<Monster>();

  // State to trigger animation showing or not
  const [showAnimation] = useState(false);
  // #endregion

  // #region Socket Methods
  // Socket methods to communicate with server (main.ts) go here
  useEffect(() => {
    // Error checking for null socket
    if (!socket) return;


    const handleMatchStarted = (data: { myMonster: MonsterTemplate; enemyMonster: MonsterTemplate }) => {
      console.log("Match started:", data);

      setMyMonster(new Monster(data.myMonster));
      setEnemyMonster(new Monster(data.enemyMonster));
    };

    socket.on("match-started", handleMatchStarted);
  });
  //#endregion

  //#region Actions

  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    if (!socket) return;

    socket.emit('RequestSubmitMove', {
      playerSocket: usePlayerSocket,
      action,
    });

    // triggerAnimation();
  };
  //#endregion

  // HTML to show each monster and the animations
  if (!myMonster || !enemyMonster) {
    return <div>Loading battle...</div>;
  }

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        player1Monster={myMonster}
        player2Monster={enemyMonster}
        playerId1="player1-id"
        playerId2="player2-id"
      />
      <BattleBottom onAction={handleAction} />
    </div>
  );

};
