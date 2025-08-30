import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleMiddle } from "./BattleMiddle";
import { BattleBottom } from "./BattleBottom";
import { usePlayerSocket } from "../player/game/PlayerPage";
import { MonsterTemplate } from "../../simulator/core/monster/monster_template";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import { SideId } from "/imports/simulator/core/side";
import BattleMessage from "./BattleMessage";

interface BattleScreenProps {
  matchData: {
    myMonster: { template: MonsterTemplate; currentHp: number };
    enemyMonster: { template: MonsterTemplate; currentHp: number };
  };
}

type MonsterState = {
  template: MonsterTemplate;
  currentHp: number;
  playerId: string;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({ matchData }) => {
  const { socket } = usePlayerSocket();
  const [myMonster, setMyMonster] = useState<MonsterState>();
  const [enemyMonster, setEnemyMonster] = useState<MonsterState>();
  const [hasSubmittedMove, setHasSubmittedMove] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const [battleMessage, setBattleMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);

  // Initialize monsters when matchData changes
  useEffect(() => {
    setMyMonster({
      template: matchData.myMonster.template,
      currentHp:
        matchData.myMonster.currentHp ??
        matchData.myMonster.template.baseStats.health,
      playerId: "player1",
    });
    setEnemyMonster({
      template: matchData.enemyMonster.template,
      currentHp:
        matchData.enemyMonster.currentHp ??
        matchData.enemyMonster.template.baseStats.health,
      playerId: "player2",
    });
  }, [matchData]);

  // Listen for 'match-started' socket event
  useEffect(() => {
    if (!socket) return undefined;
    const handleMatchStarted = (data: any) => {
      console.log("Match started:", data);
    };
    socket.on("match-started", handleMatchStarted);
    return () => {
      socket.off("match-started", handleMatchStarted);
    };
  }, [socket]);

  const triggerAnimation = (): void => {
    if (!showAnimation) setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
  };

  const showBattleMessage = (message: string): void => {
    setBattleMessage(message);
    setShowMessage(true);

    // Auto-hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
  };

  // Handle player action
  const handleAction = (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    targetSide: SideId
  ) => {
    if (!socket || !myMonster) return;

    const data = { moveId, targetMethod, targetSide };
    socket.emit("RequestSubmitMove", { data });
    setHasSubmittedMove(true);

    // Distinguish by moveId (attack vs ability vs defend)

    triggerAnimation();

    if (moveId === myMonster.template.attackActionId) {
      setEnemySlash(true);

      // get damage from attacker’s template
      const dmg = myMonster.template.baseStats.attack;

      showBattleMessage(`Damage dealt: ${dmg}`);

      setEnemyMonster((prev) =>
        prev
          ? {
              ...prev,
              // subtract damage from current HP
              currentHp: Math.max(0, prev.currentHp - dmg),
            }
          : prev
      );
    } else if (moveId === myMonster.template.defendActionId) {
      setPlayerSlash(false);
      showBattleMessage("Uses defense");
    } else if (myMonster.template.abilityActionId) {
      setEnemySlash(false);
      showBattleMessage("Uses ability!");
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleUnlock = () => setHasSubmittedMove(false);
    socket.on("UnlockButton", handleUnlock);
    return () => {
      socket.off("UnlockButton", handleUnlock);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleHealthUpdate = ({
      playerId: targetId,
      newHp,
    }: {
      playerId: string;
      newHp: number;
    }) => {
      if (targetId === "player1" && myMonster) {
        setMyMonster((prev) => (prev ? { ...prev, currentHp: newHp } : prev));
      } else if (targetId === "player2" && enemyMonster) {
        setEnemyMonster((prev) =>
          prev ? { ...prev, currentHp: newHp } : prev
        );
      }
    };

    socket.on("update-hp", handleHealthUpdate);
    return () => {
      socket.off("update-hp", handleHealthUpdate);
    };
  }, [socket, myMonster?.playerId, enemyMonster?.playerId]);

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />

      {showMessage && <BattleMessage message={battleMessage} />}

      <BattleMiddle
        showAnimation={showAnimation}
        player1={myMonster}
        player2={enemyMonster}
        enemySlashVisible={enemySlash}
        onEnemySlashComplete={() => setEnemySlash(false)}
        playerSlashVisible={playerSlash}
        onPlayerSlashComplete={() => setPlayerSlash(false)}
      />
      <BattleBottom
        onAction={handleAction}
        disabled={hasSubmittedMove}
        myMonsterMoves={{
          attack: myMonster.template.attackActionId,
          defend: myMonster.template.defendActionId,
          ability: myMonster.template.abilityActionId,
        }}
      />
    </div>
  );
};
