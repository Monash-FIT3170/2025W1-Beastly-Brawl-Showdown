import React, { useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';

export const BattleScreen: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState<boolean>(false);

  // Function to trigger the rolling animation
  const triggerAnimation = (): void => {
    if (!showAnimation) {
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
