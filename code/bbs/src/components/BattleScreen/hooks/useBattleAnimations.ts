import { useState } from "react";

export type AbilityKind = "stun" | "dodge" | "double-attack" | "attack-bonus-next3" | null;

export function useBattleAnimations() {
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);
  const [enemyAbilityKind, setEnemyAbilityKind] = useState<AbilityKind>(null);
  const [playerAbilityKind, setPlayerAbilityKind] = useState<AbilityKind>(null);

  const toAbilityKind = (moveId: string): AbilityKind => {
    if (moveId === "stun") return "stun";
    if (moveId === "dodge") return "dodge";
    if (moveId === "double-attack") return "double-attack";
    if (moveId === "attack-bonus-next3") return "attack-bonus-next3";
    return null; 
  };

  const abilityTarget: Record<Exclude<AbilityKind, null>, "self" | "opponent"> = {
    stun: "opponent", 
    dodge: "self",
    "double-attack": "self",
    "attack-bonus-next3": "self",
  };

  const performMoveAnimation = async (
    moveId: string,
    actor: "player1" | "player2"
  ) => {
    const kind = toAbilityKind(moveId);
    if (kind) {
      const targetType = abilityTarget[kind]; // "self" | "opponent"

      // choose which ring to show based on the actor and targetType
      const showOn =
        targetType === "self"
          ? actor
          : actor === "player1"
            ? "player2"
            : "player1";

      if (showOn === "player1") {
        // show on player1's ring
        setPlayerAbilityKind(kind);
        setPlayerAbility(true);
      } else {
        // show on player2's (enemy) ring
        setEnemyAbilityKind(kind);
        setEnemyAbility(true);
      }
      // let the overlay play (your components also call onComplete to clear)
      await new Promise((r) => setTimeout(r, 2000));
      return;
    }

    if (moveId.includes("attack")) {
      if (actor === "player1") setEnemySlash(true);
      else setPlayerSlash(true);
    } else if (moveId.includes("defend")) {
      if (actor === "player1") setPlayerShield(true);
      else setEnemyShield(true);
    }
  };

  const resetAnimations = () => {
    setEnemySlash(false);
    setPlayerSlash(false);
    setEnemyShield(false);
    setPlayerShield(false);
    setEnemyAbility(false);
    setPlayerAbility(false);
    setEnemyAbilityKind(null); 
    setPlayerAbilityKind(null);
  };

  return {
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
    enemyAbilityKind,
    playerAbility,
    setPlayerAbility,
    playerAbilityKind,
    performMoveAnimation,
    resetAnimations,
  };
}
