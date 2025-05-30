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

    // Sets the monsters that battle when the game start is triggered
    const handleMatchStarted = (data: { enemyMonster: Monsters }) => {
      setenemyMonsterMonster(data.enemyMonster);
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
      playerId: 'player1-id',
      action,
    });

    // triggerAnimation();
  };
  //#endregion

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
