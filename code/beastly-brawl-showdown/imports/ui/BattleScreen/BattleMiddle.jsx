import React from 'react';
import { BattleMonster } from './BattleMonster.jsx';

export const BattleMiddle = () => {
  const attackAnimation = () => {
    // TODO: add attack animation logic here
    console.log("Attack");
  };

  return (
    <div className="battleMiddle">
      <BattleMonster image="/img/miku.jpg" alt="Monster 1"  position={"monster1"}/>
      <BattleMonster image="/img/masterChief.jpg" alt="Monster 2" position={"monster2"}/>
    </div>
  );
};
