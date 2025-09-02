import { Player } from "./player";
import { AccountId } from "../shared/types";
import { Battle, BattleOptions } from "/app/simulator//core/battle";
import { SideId } from "/app/simulator//core/side";
import { COMMON_MONSTER_POOL } from "/app/simulator//data/common/common_monster_pool";
import { COMMON_MOVE_POOL } from "/app/simulator//data/common/common_move_pool";
import { log_event } from "./utils";
import { MonsterId } from "/app/simulator//core/monster/monster_pool";
import { TargetingData } from "/app/simulator//core/action/targeting";
import { EntryID } from "/app/simulator//core/utils";
import { ChooseMove } from "/app/simulator//core/notice/notice";
import { TargetingMethod } from "/app/simulator//core/action/targeting";

enum MatchType {
    DUEL,
    BYE
}

export class Match {
    player1: Player;
    player2?: Player;
    winner?: Player;
    spectators: AccountId[];
    matchType: MatchType;
    matchID: number;
    battle?: Battle;
    playerChannel: any;

    /**
     * Constructor.
     * 
     * @param player1 A player in the match
     * @param matchID Unique integer created in tournament_manager
     * @param player2 Optional second player in the match (the match is a bye if left empty)
     */
    constructor(player1: Player, player2: Player | undefined, matchID: number, playerChannel: any) {
        this.player1 = player1;
        this.player2 = player2;
        this.spectators = player1.spectators.concat(player2?.spectators ?? []);
        this.matchType = player2 ? MatchType.DUEL : MatchType.BYE;
        this.matchID = matchID;
        this.playerChannel = playerChannel;
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
        };


        this.battle = new Battle(options);
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
    submitMove(player: Player, moveId: EntryID, targetMethod: TargetingMethod, targetSide: SideId): void {
        if (this.matchType === MatchType.BYE || !this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to submit moves to.`);
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

        chooseMoveNotice.callback(moveId, targetData);
    }


    /**
     * Called by tournament_manager when all matches are ready to commence.
     * Initialises and runs the battle, then processes the winner and loser after completion.
     * Winner is stored in winner and loser is added to winner's list of spectators.
     * 
     * @param playersByAccountId Hashmap of players in the tournament
     * @returns None
     */
    async runBattle(playerChannel: any): Promise<void> {

        if (this.matchType === MatchType.BYE) {
            this.winner = this.player1;
            console.log(`Match ${this.matchID} is a bye. Player ${this.player1.displayName} automatically advances.`);
            return;
        }

        if (!this.battle) {
            throw new Error(`Match ${this.matchID} has no battle to run.`);
        }

        // Attach notice callbacks to socket
        this.battle.noticeBoard.subscribeListener({
            onPostNotice: (sideIndex, notice) => {
                const player = sideIndex === 0 ? this.player1 : this.player2!;
                this.playerChannel.to(player.socketId).emit("newNotice", notice);
            },
            onRemoveNotice: (sideIndex, notice) => {
                const player = sideIndex === 0 ? this.player1 : this.player2!;
                this.playerChannel.to(player.socketId).emit("removeNotice", notice);
            }
        });


        await this.battle.run();

        const survivingSide = this.battle.sides.find(side => side.monster.health > 0);
        const winnerIndex = this.battle.sides.indexOf(survivingSide!);

        this.winner = winnerIndex === 0 ? this.player1 : this.player2;
        const loser = winnerIndex === 0 ? this.player2 : this.player1;

        if (loser) {
            if (loser.linkedAccountId) {
                this.winner?.addSpectator(loser.linkedAccountId);
            }
            console.log(`Match ${this.matchID}: Player ${loser.displayName} has been defeated.`);
        }
    }
}