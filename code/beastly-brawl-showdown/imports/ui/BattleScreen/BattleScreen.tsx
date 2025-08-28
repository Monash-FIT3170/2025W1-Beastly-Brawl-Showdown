import React, { useEffect, useState } from 'react';
import { BattleTop } from './BattleTop';
import { BattleMiddle } from './BattleMiddle';
import { BattleBottom } from './BattleBottom';
import { usePlayerSocket } from '../player/game/PlayerPage';
import { MonsterTemplate } from '../../simulator/core/monster/monster_template';
import { EntryID } from '/imports/simulator/core/utils';
import { TargetingMethod } from '/imports/simulator/core/action/targeting';
import { SideId } from '/imports/simulator/core/side';

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
  const [showAnimation] = useState(false);

  // Initialize monsters when matchData changes
  useEffect(() => {
    setMyMonster({
      template: matchData.myMonster.template,
      currentHp: matchData.myMonster.currentHp,
      playerId: 'player1'
    });
    setEnemyMonster({
      template: matchData.enemyMonster.template,
      currentHp: matchData.enemyMonster.currentHp,
      playerId: 'player2'
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

  // Handle player action
  const handleAction = (moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId) => {
    if (!socket) return;

    const data = { moveId, targetMethod, targetSide };

    // Send as one `data` object
    socket.emit("RequestSubmitMove", { data });
    setHasSubmittedMove(true);
  };

  if (!myMonster || !enemyMonster) return <div>Loading battle...</div>;

  return (
    <div className="canvas-body" id="battle-screen-body">
      <BattleTop />
      <BattleMiddle
        showAnimation={showAnimation}
        player1={myMonster}
        player2={enemyMonster}
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
