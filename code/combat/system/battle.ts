import { Side, SideId } from "./side";
import { Monster, MonsterTemplate } from "./monster/monster";
import { ChooseMove as chooseMove } from "./notice/notice";
import { NoticeBoard } from "./notice/notice_board";
import { EventHistory } from "./history/event_history";
import { BattleOverEvent, SnapshotEvent } from "./history/events";
import { movePool } from "../data/move_pool";
import { MoveData, MoveRequest } from "./action/move";
import { SingleEnemyTargeting } from "./action/targeting";
import { EntryID } from "./types";
export interface PlayerOptions {
  name: string;
  /**
   * A copy of a template
   */
  monsterTemplate: MonsterTemplate; //! Can change to list if needed later
}

export type BattleOptions = {
  seed: number;

  playerOptionSet: PlayerOptions[];

  player_option_timeout: number;
};

export class Battle {
  readonly seed: number;
  readonly sides: Side[];
  readonly eventHistory: EventHistory;

  readonly noticeBoard: NoticeBoard;

  readonly player_option_timeout: number;

  constructor(options: BattleOptions) {
    this.seed = options.seed;

    this.sides = options.playerOptionSet.map((playerOptions, idx) => {
      const side: Side = {
        id: idx as SideId,
        monster: new Monster(playerOptions.monsterTemplate),
        pendingActions: null,
      };
      return side;
    });

    this.eventHistory = new EventHistory();

    this.noticeBoard = new NoticeBoard(options.playerOptionSet.length);

    this.player_option_timeout = options.player_option_timeout;
  }

  // TODO ? make the battle director a swappable component
  async run(): Promise<void> {
    console.log("Battle: Start");

    const initialState: SnapshotEvent = {
      name: "snapshot",
      sides: JSON.parse(JSON.stringify(this.sides)),
    };
    this.eventHistory.addEvent(initialState);

    // TODO exit
    while (this.sides.every((side) => side.monster.health > 0)) {
      //#########################
      //# Start of turn trigger #
      //#########################
      this.sides.forEach((side) => {
        side.monster.components.forEach((component) => {
          if (component.onStartTurn === undefined) {
            return;
          }
          component.onStartTurn(this, side.id);
        });
      });

      //##################
      //# Gather Actions #
      //##################
      console.log(`Gather moves: Start`);
      await new Promise<void>((resolve) => {
        this.sides.forEach((side) => {
          const callback: (moveId: EntryID, target: SideId) => void = (moveId: EntryID, target: SideId): void => {
            // TODO validate move
            // TODO allow selecting of other targeting methods
            side.pendingActions = [
              {
                moveId: moveId,
                source: side.id,
                targetingData: { targetingMethod: "single-enemy", target: target },
              },
            ]; /// Save to data
            this.noticeBoard.removeNotice(side.id, "chooseMove");

            /// All if all sides ready -> move to next stage
            if (this.sides.every((side) => side.pendingActions)) {
              resolve();
            }
          };
          //have a typed move options list, instead of ternary operators
          //holds moves with their EntryIDs and consitions (move allowed or not)
          const moveOptions: { id: EntryID | null, condition: boolean }[] = [
          { id: side.monster.base.attackActionId || null, condition: true },
          { id: side.monster.base.defendActionId || null, condition: side.monster.defendActionCharges > 0 },
          { id: side.monster.base.abilityActionId || null, condition: side.monster.base.abilityActionId != null }

          ];

          // filter out moves where condition is false or id is null, 
          // then extract the valid EntryIDs into moveIdOptions
          const moveIdOptions = moveOptions
            .filter(option => option.condition && option.id !== null)
            .map(option => option.id as EntryID);

          const notice: chooseMove = {
            kind: "chooseMove",
            data: {
              moveIdOptions: moveIdOptions
            },
            callback: callback,
          };
          this.noticeBoard.postNotice(side.id, notice);
        });
      });
      console.log(`Gather moves: Complete`);

      //#################
      //# Order Actions #
      //#################
      const allMovesUnsorted: MoveRequest[] = this.sides
        .map((side) => side.pendingActions)
        .filter((actions) => actions !== null)
        .flat();
      this.sides.forEach((side) => (side.pendingActions = null)); /// Remove from pending
      const moveRequestQueue: MoveRequest[] = allMovesUnsorted.sort((a, b) => {
        /// Sort by move priority class
        const moveA: MoveData = movePool[a.moveId];
        const moveB: MoveData = movePool[b.moveId];
        if (moveA.priorityClass !== moveB.priorityClass) {
          return moveB.priorityClass - moveA.priorityClass;
        }

        /// Sort by source monster speed --> updated
        const speedB = this.sides[b.source].monster.getSpeed();
        const speedA = this.sides[a.source].monster.getSpeed();
        return speedB - speedA;

      });
      console.log(`Acton Queue:\n${JSON.stringify(moveRequestQueue)}`);

      //###################
      //# Resolve Actions #
      //###################
      console.log("Resolve Actions");
      for (const moveRequest of moveRequestQueue) {
        const move: MoveData = movePool[moveRequest.moveId];
        // if (!actionHandler) {
        //   throw new Error(`Action of this id=${action.actionId} does not exist.`);
        // }

        if (this.sides[moveRequest.source].monster.getIsBlockedFromMove()) {
          console.log(`Monster could not perform move right now (probs status).`);
          continue;
        }

        await move.perform(this, moveRequest.source, moveRequest.targetingData);
        console.log(`Resolved move id=${moveRequest.moveId}`);
      }

      //#######################
      //# End of turn trigger #
      //#######################
      this.sides.forEach((side) => {
        side.monster.components.forEach((component) => {
          if (component.onEndTurn === undefined) {
            return;
          }
          component.onEndTurn(this, side.id);
        });
      });

      const endOfTurnSnapshotEvent: SnapshotEvent = {
        name: "snapshot",
        sides: JSON.parse(JSON.stringify(this.sides)),
      };
      this.eventHistory.addEvent(endOfTurnSnapshotEvent);
    }

    const battleOverEvent: BattleOverEvent = {
      name: "battleOver",
    };
    this.eventHistory.addEvent(battleOverEvent);
  }
}
