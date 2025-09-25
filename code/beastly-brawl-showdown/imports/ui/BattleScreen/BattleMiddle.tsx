import React, { useEffect, useState } from "react";
import { MonsterTemplate } from "../../simulator/core/monster/monster_template";
import MonsterHealthRing from "./MonsterHealthRing";

type BattleMiddleProps = {
  showAnimation: boolean;
  player1: { template: MonsterTemplate; currentHp: number; playerId: string };
  player2: { template: MonsterTemplate; currentHp: number; playerId: string };
  enemySlashVisible?: boolean;
  onEnemySlashComplete?: () => void;
  playerSlashVisible?: boolean;
  onPlayerSlashComplete?: () => void;
  enemyShieldVisible?: boolean;
  onEnemyShieldComplete?: () => void;
  playerShieldVisible?: boolean;
  onPlayerShieldComplete?: () => void;
  enemyAbilityVisible?: boolean;
  onEnemyAbilityComplete?: () => void;
  playerAbilityVisible?: boolean;
  onPlayerAbilityComplete?: () => void;
};

export const BattleMiddle: React.FC<BattleMiddleProps> = ({
  showAnimation,
  player1,
  player2,
  enemySlashVisible,
  onEnemySlashComplete,
  playerSlashVisible,
  onPlayerSlashComplete,
  enemyShieldVisible,
  onEnemyShieldComplete,
  playerShieldVisible,
  onPlayerShieldComplete,
  enemyAbilityVisible,
  onEnemyAbilityComplete,
  playerAbilityVisible,
  onPlayerAbilityComplete,
}) => {
  const [_, setDisplayedNumber] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (showAnimation) {
      let i = 0;
      const rollDuration = 1000;
      const intervalSpeed = 100;
      const totalSteps = rollDuration / intervalSpeed;
      const finalResult = 20; // replace with real dice roll later

      interval = setInterval(() => {
        if (i < totalSteps) {
          setDisplayedNumber(Math.floor(Math.random() * 20) + 1);
          i++;
        } else {
          clearInterval(interval);
          setDisplayedNumber(finalResult);

          timeout = setTimeout(() => console.log("Final result shown"), 3000);
        }
      }, intervalSpeed);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showAnimation]);

  return (
    // <div className="battleMiddle">
    //   <BattleMonster {...player1} position="monster1" />
    //   {showAnimation && (
    //     <div className="diceAnimation">
    //       <img
    //         src="/img/d20.png"
    //         alt="Rolling animation"
    //         className="diceAnimation"
    //       />
    //       <span className="diceResult">{displayedNumber}</span>
    //     </div>
    //   )}
    //   <BattleMonster {...player2} position="monster2" />
    // </div>

    <div className="combat-arena">
      <MonsterHealthRing
        currentHealth={player2.currentHp}
        maxHealth={player2.template.baseStats.health}
        imageSrc={player2.template.imageUrl}
        monsterName={player2.template.name}
        baseStats={{
          attack: player2.template.baseStats.attack,
          defense: player2.template.baseStats.armour,
        }}
        abilityName={player2.template.abilityActionId}
        showSlash={enemySlashVisible}
        onSlashComplete={onEnemySlashComplete}
        showShield={enemyShieldVisible}
        onShieldComplete={onEnemyShieldComplete}
        showAbility={enemyAbilityVisible}
        onAbilityComplete={onEnemyAbilityComplete}
      />

      {/* {showAnimation && (
        <div className="diceAnimation">
          <img
            src="/img/d20.png"
            alt="Rolling dice"
            className="diceAnimation"
          />
          <span className="diceResult">{displayedNumber}</span>
        </div>
      )} */}

      <MonsterHealthRing
        currentHealth={player1.currentHp}
        maxHealth={player1.template.baseStats.health}
        imageSrc={player1.template.imageUrl}
        monsterName={player1.template.name}
        baseStats={{
          attack: player1.template.baseStats.attack,
          defense: player1.template.baseStats.armour,
        }}
        abilityName={player1.template.abilityActionId}
        showSlash={playerSlashVisible}
        onSlashComplete={onPlayerSlashComplete}
        showShield={playerShieldVisible}
        onShieldComplete={onPlayerShieldComplete}
        showAbility={playerAbilityVisible}
        onAbilityComplete={onPlayerAbilityComplete}
      />
    </div>
  );
};
