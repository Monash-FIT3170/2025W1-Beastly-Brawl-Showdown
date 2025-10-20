import { useState } from "react";

export function useBattleAnimations() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);

  const performMoveAnimation = async (
    moveId: string,
    actor: "player1" | "player2"
  ) => {
    if (moveId.includes("attack")) {
      if (actor === "player1") setEnemySlash(true);
      else setPlayerSlash(true);
    } else if (moveId.includes("defend")) {
      if (actor === "player1") setPlayerShield(true);
      else setEnemyShield(true);
    } else if (moveId.includes("ability")) {
      if (actor === "player1") setPlayerAbility(true);
      else setEnemyAbility(true);
    }

    setShowAnimation(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setShowAnimation(false);

    if (actor === "player1") {
      setPlayerSlash(false);
      setPlayerShield(false);
      setPlayerAbility(false);
    } else {
      setEnemySlash(false);
      setEnemyShield(false);
      setEnemyAbility(false);
    }
  };

  const resetAnimations = () => {
    setShowAnimation(false);
    setEnemySlash(false);
    setPlayerSlash(false);
    setEnemyShield(false);
    setPlayerShield(false);
    setEnemyAbility(false);
    setPlayerAbility(false);
  };

  return {
    showAnimation,
    setShowAnimation,
    enemySlash,
    setEnemySlash,
    playerSlash,
    setPlayerSlash,
    enemyShield,
    setEnemyShield,
    playerShield,
    setPlayerShield,
    enemyAbility,
    setEnemyAbility,
    playerAbility,
    setPlayerAbility,
    performMoveAnimation,
    resetAnimations,
  };
}
