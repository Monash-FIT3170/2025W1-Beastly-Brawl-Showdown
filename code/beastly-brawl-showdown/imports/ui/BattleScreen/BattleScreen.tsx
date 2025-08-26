import React, { useEffect, useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';
import { Monster, MonsterTemplate } from '/imports/simulator/core/monster/monster';

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

    //#region RECEIVE DICE AND ATTACK ANIMATIONS
    //     let interval: NodeJS.Timeout;
    // let timeout: NodeJS.Timeout;

    // if (showAnimation) {
    //   let i = 0;
    //   const rollDuration = 1000; // total roll duration in ms
    //   const intervalSpeed = 100; // time between number updates

    //   const finalResult = 20; // eventually will replace with dice roll utility
    //   const totalSteps = rollDuration / intervalSpeed; //get the ammount of times it gets swaped out

    //   interval = setInterval(() => {
    //     if (i < totalSteps) {
    //       setDisplayedNumber(Math.floor(Math.random() * 20) + 1); // roll 1-20
    //       i++;
    //     } else {
    //       clearInterval(interval);
    //       setDisplayedNumber(finalResult);

    //       timeout = setTimeout(() => {
    //         console.log("Final result displayed for 3 seconds");
    //       }, 3000);
    //     }
    //   }, intervalSpeed);
    // }
    //#endregion
  });
  //#endregion

  //#region Actions
  // const triggerAnimation = () => {
  //   if (!showAnimation) {
  //     setShowAnimation(true);
  //     setTimeout(() => setShowAnimation(false), 3000);
  //   }
  // };

  const handleAction = (action: 'attack' | 'defend' | 'ability') => {
    if (!socket) return;

    socket.emit('playerAction', {
      playerSocket: usePlayerSocket,
      action,
    });

    // triggerAnimation();
  };
  //#endregion
  if (!myMonster || !enemyMonster) {
    return <div>Loading battle...</div>;
  }


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
