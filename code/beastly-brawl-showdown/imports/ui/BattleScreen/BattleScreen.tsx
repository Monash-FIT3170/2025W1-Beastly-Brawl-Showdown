import React, { useEffect, useState } from "react";
import { BattleTop } from "./BattleTop";
import { BattleMiddle } from "./BattleMiddle";
import { BattleBottom } from "./BattleBottom";
import { usePlayerSocket } from "../player/game/PlayerPage";
import { MonsterTemplate } from "../../simulator/core/monster/monster_template";
import { EntryID } from "/imports/simulator/core/utils";
import { TargetingMethod } from "/imports/simulator/core/action/targeting";
import BattleMessage from "./BattleMessage";
import { DamageEvent } from "/imports/simulator/core/event/core_events";
import { Notice } from "/imports/simulator/core/notice/notice";

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
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);

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

  //just copying your event handler code but repurposing for roll
  useEffect(() => {
    if (!socket) return;

    const handleNewNotice = (notice: Notice) => {
      console.log("Notice received:", notice);
      if (notice.kind === "roll") {
        const params: Parameters<typeof notice.callback> = [];
        socket.emit("requestRoll", notice.kind, params);
        console.log("attmpted to send back roll notice resolve")
      }
    };
    socket.on("newNotice", handleNewNotice);
    return () => {
      socket.off("newNotice", handleNewNotice);
    };
  }, [socket]);

  // Function to trigger move animations
  const performMoveAnimation = async (
    moveId: EntryID,
    actor: "player1" | "player2"
  ) => {
    if (!myMonster || !enemyMonster) return;

    let message = "";
    const template =
      actor === "player1" ? myMonster.template : enemyMonster.template;

    if (moveId === template.attackActionId) {
      message = actor === "player1" ? "You attack!" : "Enemy attacks!";
      if (actor === "player1") setEnemySlash(true);
      else setPlayerSlash(true);
    } else if (moveId === template.defendActionId) {
      message = actor === "player1" ? "You defend!" : "Enemy defends!";
      if (actor === "player1") setPlayerShield(true);
      else setEnemyShield(true);
    } else if (moveId === template.abilityActionId) {
      message =
        actor === "player1" ? "You use your ability!" : "Enemy uses ability!";
      if (actor === "player1") setPlayerAbility(true);
      else setEnemyAbility(true);
    }

    setBattleMessage(message);
    setShowMessage(true);
    setShowAnimation(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setShowAnimation(false);
    setShowMessage(false);

    // Only clear slashes if they were set
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
  // Handle player action (submit move to server)
  const handleAction = (
    moveId: EntryID,
    targetMethod: TargetingMethod
  ) => {
    if (!socket || !myMonster) return;

    const data = { moveId, targetMethod };
    socket.emit("RequestSubmitMove", { data });
    console.log("Attempted to submit move")
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

  // Listen for new battle events from server (only DamageEvent for now)
  useEffect(() => {
    if (!socket) return;
    const handleNewEvent = (event: any) => {
      if (!myMonster || !enemyMonster) return;
      console.log("received" + event.name)

      if (event.name === "damage") {
        const damageEvent = event as DamageEvent;
        if (damageEvent.target === 0) {
          // player1 took damage
          setMyMonster((prev) => prev ? { ...prev, currentHp: prev.currentHp - damageEvent.amount } : prev);
        } else if (damageEvent.target === 1) {
          // player2 took damage
          setEnemyMonster((prev) => prev ? { ...prev, currentHp: prev.currentHp - damageEvent.amount } : prev);
        }
      }
    };
    socket.on("newEvent", handleNewEvent);
    return () => {
      socket.off("newEvent", handleNewEvent);
    };
  }, [socket, myMonster, enemyMonster]);

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
      console.log("handle execution is reahced, meaning taht execute turn was received")
      performMoveAnimation(playerMove.moveId, "player1").then(() =>
        performMoveAnimation(enemyMove.moveId, "player2")
      );
    };

    socket.on("ExecuteTurn", handleExecuteTurn);

    return () => {
      socket.off("ExecuteTurn", handleExecuteTurn)
    };
  }, [socket, myMonster, enemyMonster]);

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
      socket.off("ExecuteTurn", handleExecuteTurn);
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
        enemyShieldVisible={enemyShield}
        onEnemyShieldComplete={() => setEnemyShield(false)}
        playerShieldVisible={playerShield}
        onPlayerShieldComplete={() => setPlayerShield(false)}
        enemyAbilityVisible={enemyAbility}
        onEnemyAbilityComplete={() => setEnemyAbility(false)}
        playerAbilityVisible={playerAbility}
        onPlayerAbilityComplete={() => setPlayerAbility(false)}
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
