import React, { useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleMiddle } from "./BattleMiddle";
import { BattleBottom } from "./BattleBottom";

export const BattleScreen: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);

  // Function to trigger the rolling animation
  const triggerAnimation = (): void => {
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  const handleRoll = () => {
    triggerAnimation();
    const dmg = 15;
    setEnemyHp((hp) => Math.max(0, hp - dmg));
  };

  return (
    <div className="battleScreen">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        enemyHp={enemyHp}
        playerHp={playerHp}
      />
      <BattleBottom
        onAttack={handleRoll}
        onAbility={triggerAnimation}
        onDefend={triggerAnimation}
      />
    </div>
  );
};
