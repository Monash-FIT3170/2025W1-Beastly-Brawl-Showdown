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
import { Notice, Roll } from "/imports/simulator/core/notice/notice";
import { roll } from "/imports/simulator/core/roll";
import { BattleScene } from "./simulator/extensions/visualiser/src/Components/battle_scene"

interface BattleScreenProps {
  matchData: {
    myMonster: { template: MonsterTemplate; currentHp: number };
    enemyMonster: { template: MonsterTemplate; currentHp: number };
    myid: number;
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
  const [buttonDisabled, setbuttonDisabled] = useState(false);

  const [showAnimation, setShowAnimation] = useState(false);
  const [battleMessage, setBattleMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const [enemySlash, setEnemySlash] = useState(false);
  const [playerSlash, setPlayerSlash] = useState(false);
  const [enemyShield, setEnemyShield] = useState(false);
  const [playerShield, setPlayerShield] = useState(false);
  const [enemyAbility, setEnemyAbility] = useState(false);
  const [playerAbility, setPlayerAbility] = useState(false);

  const [rollNotice, setRollNotice] = useState<Roll | null>(null);
  const [showEnemySubmittedMessage, setshowEnemySubmittedMessage] = useState(false);
  const [showSubmittedMoveMessage, setshowSubmittedMoveMessage] = useState(false);

  //#region Test States
  const [events, setEvents] = useState<any[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  function rollNow(rollNotice : Roll): void {
    if (!socket) return;
    setShowMessage(false)
    const params: Parameters<typeof rollNotice.callback> = [];
    socket.emit("requestRoll", rollNotice.kind, params);
    setRollNotice(null)
  }

    useEffect(() => {
    if (!socket) return;

    const handleEnemySubmitted = () => {
      setshowEnemySubmittedMessage(true)
    };

    socket.on("EnemySubmitted", handleEnemySubmitted);
    return () => {
      socket.off("EnemySubmitted", handleEnemySubmitted);
    }
  }, [socket]);

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
    console.log("Match data:", matchData)

    // Build snapshot JSON
    const snapshot = {
      name: "snapshot",
      sides: [
        {
          id: 0,
          monster: {
            baseID: matchData.myMonster.template.templateId,
            health:
              matchData.myMonster.currentHp ??
              matchData.myMonster.template.baseStats.health,
            defendActionCharges: 0,
            components: [],
          },
          pendingActions: null,
        },
        {
          id: 1,
          monster: {
            baseID: matchData.enemyMonster.template.templateId,
            health:
              matchData.enemyMonster.currentHp ??
              matchData.enemyMonster.template.baseStats.health,
            defendActionCharges: 0,
            components: [],
          },
          pendingActions: null,
        },
      ],
      index: 0,
    };

    // put snapshot into events state as the first item
    setEvents([snapshot]);
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
        setshowEnemySubmittedMessage(false)
        setshowSubmittedMoveMessage(false)
        setShowMessage(true)
        setBattleMessage("Time To Roll!")
        setRollNotice(notice)
      }
      if (notice.kind === "chooseMove")
        setbuttonDisabled(false)
    };
    socket.on("newNotice", handleNewNotice);
    return () => {
      socket.off("newNotice", handleNewNotice);
    };
  }, [socket]);

  // // Function to trigger move animations
  // const performMoveAnimation = async (
  //   moveId: EntryID,
  //   actor: "player1" | "player2"
  // ) => {
  //   if (!myMonster || !enemyMonster) return;

  //   let message = "";
    
  //   const template = actor === "player1" ? myMonster.template : enemyMonster.template;

  //   if (moveId === template.attackActionId) {
  //     message = actor === "player1" ? "You attack!" : "Enemy attacks!";
  //     if (actor === "player1") setPlayerSlash(true);
  //     else setEnemySlash(true);
  //   } else if (moveId === template.defendActionId) {
  //     message = actor === "player1" ? "You defend!" : "Enemy defends!";
  //   } else if (moveId === template.abilityActionId) {
  //     message = actor === "player1" ? "You use your ability!" : "Enemy uses ability!";
  //   }

  //   setBattleMessage(message);
  //   setShowAnimation(true);

  //   if (message != ""){    
  //     setShowMessage(true);
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     setShowMessage(false);
  //   }
  //   setShowAnimation(false);
  //   if (showMessage){
  //     setShowMessage(false);
  //   }
    

  //   if (actor === "player1") setPlayerSlash(false);
  //   else setEnemySlash(false);

  // };

  // Handle player action (submit move to server)
  const handleAction = (
    moveId: EntryID,
    targetMethod: TargetingMethod
  ) => {
    if (!socket || !myMonster) return;

    const data = { moveId, targetMethod };
    socket.emit("RequestSubmitMove", { data });
    setshowSubmittedMoveMessage(true)
    setbuttonDisabled(true)
  };

  // GET READY TO UNLOCK BUTTON ON NEXT TURN
  useEffect(() => {
    if (!socket) return;

    const handleUnlock = () => {
      setShowMessage(false);
      setshowSubmittedMoveMessage(false);
      setshowEnemySubmittedMessage(false)
    };

    socket.on("UnlockButton", handleUnlock);
    return () => {
      socket.off("UnlockButton", handleUnlock);
    };
  }, [socket]);

  // Listen for new battle events from server (only DamageEvent for now)
  // useEffect(() => {
  //   if (!socket) return;
  //   const handleNewEvent = (event: any) => {
  //     if (!myMonster || !enemyMonster) return;
  //     console.log("received" + event.name)

  //     if (event.name === "damage") {
  //       const damageEvent = event as DamageEvent;
  //       if (damageEvent.target === 0) {
  //         // player1 took damage
  //         setMyMonster((prev) => prev ? { ...prev, currentHp: prev.currentHp - damageEvent.amount } : prev);
  //       } else if (damageEvent.target === 1) {
  //         // player2 took damage
  //         setEnemyMonster((prev) => prev ? { ...prev, currentHp: prev.currentHp - damageEvent.amount } : prev);
  //       }
  //     }
  //   };
  //   socket.on("newEvent", handleNewEvent);
  //   return () => {
  //     socket.off("newEvent", handleNewEvent);
  //   };
  // }, [socket, myMonster, enemyMonster]);

  //#region Test Handle Event
  // Change to make it keep the new events in an array
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (ev: any) => {
      setEvents(prev => {
      const next = [...prev, ev];
      console.log("New event received:", ev.name);
      // console.log("EVENTS (next):", JSON.stringify(next));
      return next;
    });
    };

    socket.on("newEvent", handleNewEvent);
    return () => {
      socket.off("newEvent", handleNewEvent);
    }
  }, [socket]);

  
  //#region Animation Code
  // // Sequentially play animations after both players submit moves
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleExecuteTurn = ({
  //     playerMove,
  //     enemyMove,

  //   }: {
  //     playerMove: { moveId: EntryID };
  //     enemyMove: { moveId: EntryID };
  //   }) => {
  //     performMoveAnimation(playerMove.moveId, "player1").then(() =>
  //       performMoveAnimation(enemyMove.moveId, "player2")
  //     );
  //   };

  //   socket.on("ExecuteTurn", handleExecuteTurn);

  //   return () => {
  //     socket.off("ExecuteTurn", handleExecuteTurn)
  //   };
  // }, [socket, myMonster, enemyMonster]);

  // // Sequentially play animations after both players submit moves
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleExecuteTurn = ({
  //     playerMove,
  //     enemyMove,
  //   }: {
  //     playerMove: { moveId: EntryID };
  //     enemyMove: { moveId: EntryID };
  //   }) => {
  //     performMoveAnimation(playerMove.moveId, "player1").then(() =>
  //       performMoveAnimation(enemyMove.moveId, "player2")
  //     );
  //   };

  //   socket.on("ExecuteTurn", handleExecuteTurn);
  //   return () => {
  //     socket.off("ExecuteTurn", handleExecuteTurn);
  //   };
  // }, [socket, myMonster, enemyMonster]);

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />
      {/*}BattleMiddle
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
      />*/}
      <BattleScene
        events={events}
        turnIndex={turnIndex}
        isPlaying={isPlaying}
        autoAdvance={false}  // default: no autoplay
        onAdvanceTurn={(next) => setTurnIndex(next)}
        myid = {matchData.myid}
        showEnemySubmittedMessage = {showEnemySubmittedMessage}
        showSubmittedMoveMessage = {showSubmittedMoveMessage}
        showMessage = {showMessage}
      />
      <BattleBottom
        onAction={handleAction}
        onRoll={() => rollNotice && rollNow(rollNotice)}
        disabled={buttonDisabled}
        myMonsterMoves={{
          attack: myMonster.template.attackActionId,
          ability: myMonster.template.abilityActionId,
          defend: myMonster.template.defendActionId,
        }}
        mode={rollNotice ? "roll" : "combat"}
      />
    </div>
  );
};
