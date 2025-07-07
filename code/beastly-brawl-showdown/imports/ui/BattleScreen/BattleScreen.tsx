import React, { useEffect, useState } from 'react';
import { MonsterPool } from '../../../../combat/data/monster_pool';
import { makeMonster } from '../../../../combat/system/monster';
import type { Monster } from '../../../../combat/system/monster';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';

export const BattleScreen: React.FC = () => {

  // #region Variable initialisation
  // Establish connection to existing socket
  const { socket } = usePlayerSocket();

  // Initialise the 2 players
  const [myMonster, setMyMonster] = useState<Monster | null>(null);
  const [enemyMonster, setEnemyMonster] = useState<Monster | null>(null);

  // State to trigger animation showing or not
  const [showAnimation] = useState(false);
  // #endregion

  // #region Socket Methods
  // Socket methods to communicate with server (main.ts) go here
  useEffect(() => {
    // Error checking for null socket
    if (!socket) return;


    const handleMatchStarted = (data: {
      myMonster: string;
      enemyMonster: string;
      myId?: string;
      enemyId?: string;
    }) => {
      console.log('Match started:', data);

      const myMonsterTemplate = MonsterPool.find(m => m.name === data.myMonster);
      const enemyMonsterTemplate = MonsterPool.find(m => m.name === data.enemyMonster);

      if (!myMonsterTemplate || !enemyMonsterTemplate) {
        console.warn("Invalid monster name(s) received from server:", data);
        return;
      }

      // Create monster instances from templates
      setMyMonster(makeMonster(myMonsterTemplate));
      setEnemyMonster(makeMonster(enemyMonsterTemplate));
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
    <div className="battleScreen">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        player1Monster={myMonster}
        player2Monster={enemyMonster}
        playerId1={"player1-id"}
        playerId2={"player2-id"}
      />
      <BattleBottom onAction={handleAction} />
    </div>
  );

};
