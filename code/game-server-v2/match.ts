import { Player } from "./player";
import { AccountId } from "../shared/types";
import { Battle, BattleOptions, PlayerOptions } from "../simulator/core/battle"

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

    /**
     * Constructor.
     * 
     * @param player1 A player in the match
     * @param matchID Unique integer created in tournament_manager
     * @param player2 Optional second player in the match (the match is a bye if left empty)
     */
    constructor(player1: Player, matchID: number, player2?: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.spectators = player1.spectators.concat(player2?.spectators ?? []);
        this.matchType = player2 ? MatchType.DUEL : MatchType.BYE;
        this.matchID = matchID;
    }
    /**
     * Called by tournament_manager when all matches are ready to commence.
     * Initialises and runs the battle, then processes the winner and loser after completion.
     * Winner is stored in winner and loser is added to winner's list of spectators.
     * 
     * @param playersByAccountId Hashmap of players in the tournament
     * @returns None
     */
    async runBattle(playersByAccountId: Map<string, Player>): Promise<void> {
        if (this.matchType == MatchType.BYE) {
            if (this.player1.linkedAccountId) {
                this.winner = playersByAccountId.get(this.player1.linkedAccountId);
            }
            return;
        }

        if (!this.player1.monster || !this.player2?.monster) {
            throw new Error(`Match ${this.matchID}: One or both players are missing a monster.`);
        }

        const options: BattleOptions = {
        seed: Math.floor(Math.random() * 10000),
        playerOptionSet: [
            {
            name: this.player1.displayName,
            monsterTemplate: this.player1.monster,
            },
            {
            name: this.player2.displayName,
            monsterTemplate: this.player2.monster,
            },
        ],
            player_option_timeout: 30,
        };

        const battle = new Battle(options);
        await battle.run();

        const survivingSide = battle.sides.find((side) => side.monster.health > 0);
        const winnerIndex = battle.sides.indexOf(survivingSide!);
        
        const winnerId = winnerIndex === 0 
        ? this.player1.linkedAccountId 
        : this.player2?.linkedAccountId;
        if (winnerId) {
            this.winner = playersByAccountId.get(winnerId);
        }
        const loserId = this.player1.linkedAccountId === winnerId
        ? this.player2?.linkedAccountId
        : this.player1.linkedAccountId;
        if (loserId) {
            const winnerPlayer = playersByAccountId.get(loserId);
            if (winnerPlayer) {
                winnerPlayer.addSpectator(loserId);
            }
        }

        console.log(`Match ${this.matchID}: Winner is ${winnerId}`);
    }
}