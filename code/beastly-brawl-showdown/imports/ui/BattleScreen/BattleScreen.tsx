import React, { useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleMiddle } from "./BattleMiddle";
import { BattleBottom } from "./BattleBottom";
import BattleMessage from "./BattleMessage";

// Define the props type for BattleScreen
type BattleScreenProps = {
  enemyImageSrc?: string;
  playerImageSrc?: string;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({
  enemyImageSrc = "/monsters/dragon.png",
  playerImageSrc = "/monsters/wolf.png",
}) => {
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);

  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);

  // Function to trigger the rolling animation
  const triggerAnimation = (): void => {
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  const handleRoll = () => {
    triggerAnimation();
    setEnemySlash(true);
    const dmg = 15;
    setEnemyHp((hp) => Math.max(0, hp - dmg));
    const messageEl = document.querySelector(".battle-message");
    messageEl?.setAttribute("style", "display:block;");
    setTimeout(() => {
      messageEl?.setAttribute("style", "display:none;");
    }, 3000);
  };

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        enemyHp={enemyHp}
        playerHp={playerHp}
        enemyImgSrc={enemyImageSrc}
        playerImgSrc={playerImageSrc}
        enemySlashVisible={enemySlash}
        onEnemySlashComplete={() => setEnemySlash(false)}
        playerSlashVisible={playerSlash}
        onPlayerSlashComplete={() => setPlayerSlash(false)}
      />
      <BattleBottom
        onAttack={handleRoll}
        onAbility={triggerAnimation}
        onDefend={triggerAnimation}
      />

      <BattleMessage message="Damage dealt to opponent" />
    </div>
  );
};
