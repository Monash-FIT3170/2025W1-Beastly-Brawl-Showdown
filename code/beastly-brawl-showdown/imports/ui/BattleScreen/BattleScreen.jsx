import React, { useState } from 'react';
import { BattleTop } from './BattleTop.jsx';
import { BattleMiddle } from './BattleMiddle.jsx';
import { BattleBottom } from './BattleBottom.jsx';

export const BattleScreen = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  //function to trigger the rolling animation, but i'm genuinely not sure why the rolling animation spazzes out, but on the bright side, it looks like its rolling ig
  const triggerAnimation = () => {
    if(showAnimation == false){
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000); 
    }
  };

  return (
    <div className="battleScreen">
      <BattleTop />
      <BattleMiddle showAnimation={showAnimation} />
      <BattleBottom onRoll={triggerAnimation} />
    </div>
  );
};
