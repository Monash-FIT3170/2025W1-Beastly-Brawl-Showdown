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
        matchData.myMonster.currentHp ?? matchData.myMonster.template.baseStats.health,
      playerId: "player1",
    });
    setEnemyMonster({
      template: matchData.enemyMonster.template,
      currentHp:
        matchData.enemyMonster.currentHp ?? matchData.enemyMonster.template.baseStats.health,
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

  // Function to trigger move animations
  const performMoveAnimation = async (
    moveId: EntryID,
    actor: "player1" | "player2"
  ) => {
    if (!myMonster || !enemyMonster) return;

    let message = "";
    const template = actor === "player1" ? myMonster.template : enemyMonster.template;

    if (moveId === template.attackActionId) {
      message = actor === "player1" ? "You attack!" : "Enemy attacks!";
      if (actor === "player1") setPlayerSlash(true);
      else setEnemySlash(true);
    } else if (moveId === template.defendActionId) {
      message = actor === "player1" ? "You defend!" : "Enemy defends!";
    } else if (moveId === template.abilityActionId) {
      message = actor === "player1" ? "You use your ability!" : "Enemy uses ability!";
    }

    setBattleMessage(message);
    setShowMessage(true);
    setShowAnimation(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setShowAnimation(false);
    setShowMessage(false);

    // Only clear slashes if they were set
    if (actor === "player1") setPlayerSlash(false);
    else setEnemySlash(false);
  };
  // Handle player action (submit move to server)
  const handleAction = (
    moveId: EntryID,
    targetMethod: TargetingMethod,
    targetSide: SideId
  ) => {
    if (!socket || !myMonster) return;

    const data = { moveId, targetMethod, targetSide };
    socket.emit("RequestSubmitMove", { data });
    setHasSubmittedMove(true);
  };

  // Unlock buttons when server allows next turn
  useEffect(() => {
    if (!socket) return;
    const handleUnlock = () => setHasSubmittedMove(false);
    socket.on("UnlockButton", handleUnlock);
    return () => {
      socket.off("UnlockButton", handleUnlock);
    }
  }, [socket]);

  // Update HP from server events
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
      socket.off("update-hp", handleHealthUpdate)
    }
      ;
  }, [socket, myMonster?.playerId, enemyMonster?.playerId]);

  // Sequentially play animations after both players submit moves
  useEffect(() => {
    if (!socket) return;

    const handleExecuteTurn = ({
      playerMove,
      enemyMove,
    }: {
      playerMove: { moveId: EntryID };
      enemyMove: { moveId: EntryID };
    }) => {
      performMoveAnimation(playerMove.moveId, "player1").then(() =>
        performMoveAnimation(enemyMove.moveId, "player2")
      );
    };

    socket.on("ExecuteTurn", handleExecuteTurn);
    return () => {
      socket.off("ExecuteTurn", handleExecuteTurn)
    };
  }, [socket, myMonster, enemyMonster]);

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
          ability: myMonster.template.abilityActionId,
          defend: myMonster.template.defendActionId,
        }}
      />
    </div>
  );
};
