import { Player } from "./player";
import { AccountId, PlayerNamespace } from "../shared/types";
import { Battle, BattleOptions } from "../simulator/core/battle";
import { SideId } from "../simulator/core/side";
import { COMMON_MONSTER_POOL } from "../simulator/data/common/common_monster_pool";
import { COMMON_MOVE_NAMES, COMMON_MOVE_POOL } from "../simulator/data/common/common_move_pool";
import { log_attention, log_event, log_notice } from "./utils";
import { MonsterId } from "../simulator/core/monster/monster_pool";
import { TargetingData } from "../simulator/core/action/targeting";
import { EntryID } from "../simulator/core/utils";
import { ChooseMove, RerollOption, Roll } from "../simulator/core/notice/notice";
import { TargetingMethod } from "../simulator/core/action/targeting";

export enum MatchType {
    DUEL,
    BYE
}

export class Match {
    player1: Player;
    player2?: Player;
    winner?: Player;
    spectators: Player[];
    matchType: MatchType;
    matchID: number;
    battle?: Battle;

    private turnCount: number = 0;
    private submittedMoves: Map<Player, { moveId: EntryID; targetSide: SideId; targetMethod: TargetingMethod }> = new Map();


    /**
     * Constructor.
     * 
     * @param player1 A player in the match
     * @param matchID Unique integer created in tournament_manager
     * @param player2 Optional second player in the match (the match is a bye if left empty)
     */
    constructor(player1: Player, player2: Player | undefined, matchID: number) {
        this.player1 = player1;
        this.player2 = player2;
        this.spectators = player1.spectators.concat(player2?.spectators ?? []);
        this.matchType = player2 ? MatchType.DUEL : MatchType.BYE;
        this.matchID = matchID;
    }

    createBattle(): void {
        if (this.matchType == MatchType.BYE) {
            return;
        }

        // Instantiate monsters from server-side template
        const p1Template = COMMON_MONSTER_POOL.monsters[this.player1.selectedMonsterTemplateName as keyof typeof COMMON_MONSTER_POOL.monsters];
        const p2Template = this.player2
            ? COMMON_MONSTER_POOL.monsters[this.player2.selectedMonsterTemplateName as keyof typeof COMMON_MONSTER_POOL.monsters]
            : undefined;

        if (!p1Template || !p2Template) {
            throw new Error(`Match ${this.matchID}: Could not find template for one or both players.`);
        }

        // Assign templates to players (keep server-side type consistency)
        this.player1.setMonster(p1Template);
        this.player2?.setMonster(p2Template);

        log_event(`Player 1 (${this.player1.displayName}) monster template:\n${JSON.stringify(this.player1.monster, null, 2)}`);
        if (this.player2) {
            log_event(`Player 2 (${this.player2.displayName}) monster template:\n${JSON.stringify(this.player2.monster, null, 2)}`);
        }

        const options: BattleOptions = {
            seed: Math.floor(Math.random() * 10000),
            monsterPool: COMMON_MONSTER_POOL,
            movePool: COMMON_MOVE_POOL,
            playerOptionSet: [
                {
                    monsterId: this.player1.monster!.templateId as MonsterId,
                },
                {
                    monsterId: this.player2!.monster!.templateId as MonsterId,
                },
            ],

            // No playerChannel yet so this is temp
            waitForBattleOver: this.makeBattleOverWaiter(null as any)
        };

        this.battle = new Battle(options);
    }

    private makeBattleOverWaiter(playerChannel: PlayerNamespace) {
    return () =>
      new Promise<void>((resolve) => {
        const expected = this.player2 ? 2 : 1;
        const acks = new Set<string>();

        const handler = (socketId: string) => {
          acks.add(socketId);
          if (acks.size >= expected) {
            // cleanup listeners then resolve
            playerChannel.off("playerAnimationsDone", onAckFromClient);
            resolve();
          }
        };

        // Wrap to extract socket id from payload
        const onAckFromClient = (payload: { socketId: string }) => {
          if (!payload?.socketId) return;
          // Only accept acks from players in THIS match
          if (
            payload.socketId === this.player1.socketId ||
            payload.socketId === this.player2?.socketId
          ) {
            handler(payload.socketId);
          }
        };

        // Listen for client acks scoped to the /player namespace
        playerChannel.on("playerAnimationsDone", onAckFromClient);

        // Optional: safety timeout to prevent deadlocks (e.g., client disconnect)
        setTimeout(() => {
          playerChannel.off("playerAnimationsDone", onAckFromClient);
          resolve();
        }, 6000);
      });
  }

    getSideForPlayer(player: Player): number {
        if (this.matchType === MatchType.BYE || !this.battle) {
            throw new Error(`Match ${this.matchID} has no sides available.`);
        }
        if (this.player1.displayName === player.displayName) {
            return 0;
        } else if (this.player2?.displayName === player.displayName) {
            return 1;
        } else {
            throw new Error(`Player ${player.displayName} is not in this match.`);
        }
    }

    // Called by main when a player submits a move
    submitMove(player: Player, moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId, playerChannel: PlayerNamespace): void {
        if (this.matchType === MatchType.BYE || !this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to submit moves to.`);
        }

        console.log(`[MATCH DEBUG] submitMove called for ${player.displayName} with moveId ${moveId}, targetMethod ${targetMethod}, targetSide ${targetSide}`);
        // Store move
        this.submittedMoves.set(player, { moveId, targetSide, targetMethod });

        // Check if both players have submitted
        const p1Submitted = this.submittedMoves.has(this.player1);
        const p2Submitted = this.player2 ? this.submittedMoves.has(this.player2) : true;

        if (p1Submitted && p2Submitted) {
            this.turnCount++; // Increment turn
            this.sendTurnUpdate(playerChannel); // Notify clients
            this.submittedMoves.clear(); // Reset for next turn
        }


        const sideIndex = this.getSideForPlayer(player);
        const noticeMap = this.battle!.noticeBoard.noticeMaps[sideIndex];
        const chooseMoveNotice = noticeMap.get("chooseMove") as ChooseMove | undefined;

        if (!chooseMoveNotice) {
            throw new Error(`Match ${this.matchID}: Player ${player.displayName} has no chooseMove notice.`);
        }

        // Wrap SideId in a TargetingData object with the correct targetingMethod
        const targetData: TargetingData = {
            targetingMethod: targetMethod,
            target: targetSide,
        };
        console.log(`[MATCH DEBUG] Submitting move ${moveId} (${targetMethod}) for ${player.displayName}`);
        console.log(`[MATCH DEBUG] chooseMoveNotice exists?`, !!chooseMoveNotice);
        chooseMoveNotice.callback(moveId, targetData);
        console.log(`[MATCH DEBUG] Callback called for ${player.displayName}`);
    }

    // helper to broadcast turn updates
    sendTurnUpdate(playerChannel: PlayerNamespace) {
        // Emit current turn count to all players and spectators
        const players = [this.player1, this.player2].filter(Boolean) as Player[];
        players.forEach(player => {
            playerChannel.to(player.socketId).emit("turnUpdated", { turnCount: this.turnCount });
        });
        this.spectators.forEach(s => playerChannel.to(s.socketId).emit("turnUpdated", { turnCount: this.turnCount }));
    }

    // Called by main when a player submits roll notice
    submitRoll(player: Player): void {
        if (this.matchType === MatchType.BYE || !this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to submit rolls to.`);
        }

        const sideIndex = this.getSideForPlayer(player);
        const noticeMap = this.battle!.noticeBoard.noticeMaps[sideIndex];
        const rollNotice = noticeMap.get("roll") as Roll | undefined;

        if (!rollNotice) {
            throw new Error(`Match ${this.matchID}: Player ${player.displayName} has no roll notice.`);
        }
        rollNotice.callback();
    }

    // Called by main when a player submits reroll notice
    submitReroll(player: Player, option: boolean): void {
        if (this.matchType === MatchType.BYE || !this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to submit rerolls to.`);
        }

        const sideIndex = this.getSideForPlayer(player);
        const noticeMap = this.battle!.noticeBoard.noticeMaps[sideIndex];
        const rerollNotice = noticeMap.get("rerollOption") as RerollOption | undefined;

        if (!rerollNotice) {
            throw new Error(`Match ${this.matchID}: Player ${player.displayName} has no reroll notice.`);
        }
        rerollNotice.callback(option);
    }


    getPlayerMove(player: Player) {
        return this.submittedMoves.get(player);
    }

    getMonsterAbility(player: Player): COMMON_MOVE_NAMES | null {
        if (!this.battle) return null;

        const sideId = this.getSideForPlayer(player);
        const monster = this.battle.sides[sideId].monster;
        if (!monster) return null;

        const template = this.battle.monsterPool.monsters[monster.baseID as keyof typeof this.battle.monsterPool.monsters];
        return (template?.abilityActionId ?? null) as COMMON_MOVE_NAMES | null;
    }


    /**
     * Called by tournament_manager when all matches are ready to commence.
     * Initialises and runs the battle, then processes the winner and loser after completion.
     * Winner is stored in winner and loser is added to winner's list of spectators.
     * 
     * @param playersByAccountId Hashmap of players in the tournament
     * @returns None
     */
    async runBattle(playerChannel: PlayerNamespace): Promise<void> {
        if (this.matchType === MatchType.BYE) {
            this.winner = this.player1;
            log_attention(`Match ${this.matchID} is a bye. Player ${this.player1.displayName} automatically advances.`);
            return;
        }

        if (!this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to run.`);
        }

        // Attach notice callbacks to socket
        this.battle.noticeBoard.subscribeListener({
            onPostNotice: (sideIndex, notice) => {
                const player = sideIndex === 0 ? this.player1 : this.player2!;
                log_event(`[NOTICE] Sending notice '${notice.kind}' to player ${player.displayName}`);
                playerChannel.to(player.socketId).emit("newNotice", notice);
            },
            onRemoveNotice: (sideIndex, notice) => {
                const player = sideIndex === 0 ? this.player1 : this.player2!;
                log_event(`[NOTICE] Removing notice '${notice.kind}' for player ${player.displayName}`);
                playerChannel.to(player.socketId).emit("removeNotice", notice);
            }
        });

        // Subscribe to event history (damage, heals, rolls, etc.)
        this.battle.eventHistory.subscribeListener({
            onNewEvent: (event) => {
                log_event(`[EVENT] New event emitted: ${JSON.stringify(event)}`);

                // Broadcast event to both players
                log_event(`[EVENT] Sending event to player 1 (${this.player1.displayName})`);
                playerChannel.to(this.player1.socketId).emit("newEvent", event);

                if (this.player2) {
                    log_event(`[EVENT] Sending event to player 2 (${this.player2.displayName})`);
                    playerChannel.to(this.player2.socketId).emit("newEvent", event);
                }

                // Broadcast to spectators
                this.spectators.forEach(spectator => {
                    log_event(`[EVENT] Sending event to spectator (${spectator.displayName})`);
                    playerChannel.to(spectator.socketId).emit("newEvent", event);
                })
            },
        });

        this.battle["waitForBattleOver"] = this.makeBattleOverWaiter(playerChannel);

        playerChannel.to(this.player1.socketId).emit("startRound", {
            player1Monster: this.player1?.selectedMonsterTemplateName,
            player2Monster: this.player2?.selectedMonsterTemplateName, // not option if bye
            player1name: this.player1.displayName,
            player2name: this.player2?.displayName,
            sideID: 0,
        })

        if (this.player2) {
            playerChannel.to(this.player2?.socketId).emit("startRound", {
                player1Monster: this.player1?.selectedMonsterTemplateName,
                player2Monster: this.player2?.selectedMonsterTemplateName,
                player1name: this.player1.displayName,
                player2name: this.player2?.displayName,
                sideID: 1,
            })
        };

        // TODO: Emit socket for all spectators for each player
        log_attention(`Emitting to all ${this.spectators.length} spectators in match ${this.matchID}`);
        this.spectators.forEach(spectator => {
            playerChannel.to(spectator.socketId).emit("startRound", {
                player1Monster: this.player1?.selectedMonsterTemplateName,
                player2Monster: this.player2?.selectedMonsterTemplateName,
                sideID: 0,
                spectator: true
            });
        });


        log_event(`[BATTLE] Running battle for match ${this.matchID}...`);
        await this.battle.run();
        log_event(`[BATTLE] Battle finished for match ${this.matchID}.`);

        await this.waitForAnimationsAcks(playerChannel);

        const survivingSide = this.battle.sides.find(side => side.monster.health > 0);
        const winnerIndex = this.battle.sides.indexOf(survivingSide!);

        this.winner = winnerIndex === 0 ? this.player1 : this.player2;
        const loser = winnerIndex === 0 ? this.player2 : this.player1;

        if (loser) {
            this.winner?.addSpectator(loser);
            log_event(`[MATCH RESULT] Player ${loser.displayName} defeated, winner: ${this.winner?.displayName}`);
        }
        if (this.winner && loser) {
          const activeIds = new Set([
            this.player1.socketId,
            this.player2?.socketId, // may be undefined for BYE
          ]);

          // Loser should wait
          playerChannel.to(loser.socketId).emit("sendToWaiting");

          // Spectators: exclude anyone who is actually playing this match
          this.spectators
            .filter(s => !activeIds.has(s.socketId))
            .forEach(s => playerChannel.to(s.socketId).emit("sendToWaiting"));
        }
    }

     private waitForAnimationsAcks(playerChannel: PlayerNamespace): Promise<void> {
      return new Promise((resolve) => {
        const expected = this.player2 ? 2 : 1;
        const acks = new Set<string>();

        const onAck = (payload: { socketId: string }) => {
          const id = payload?.socketId;
          if (!id) return;
          // only accept acks from the two players in THIS match
          if (id === this.player1.socketId || id === this.player2?.socketId) {
            acks.add(id);
            if (acks.size >= expected) {
              playerChannel.off("playerAnimationsDone", onAck);
              resolve();
            }
          }
        };

        playerChannel.on("playerAnimationsDone", onAck);

        setTimeout(() => {
          playerChannel.off("playerAnimationsDone", onAck);
          resolve();
        }, 10000);
      });
    }
}