import { Player } from "./Player";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";
import { Action } from "./types";

export class Match {
    matchId: string;
    player1: Player;
    player2: Player;
    // Need io but leave that to harshil to do

    /**
     * Things that need to be stored in match states:
     * - Monster's state
     * - Player's actions
     */
    // I'm guessing monster object's health will change as the match progresses

    /** Map for player and monsters */
    playerMonsters: Map<Player, Monsters | undefined> = new Map<Player, Monsters>;
    /** Map for player and their selected action */
    playerActions: Map<Player, Action> = new Map<Player, Action>;

    constructor(player1: Player, player2: Player, matchId: string) {
        this.player1 = player1;
        this.player2 = player2;
        this.matchId = matchId;
        this.playerMonsters.set(player1, player1.getMonster());
        this.playerMonsters.set(player2, player2.getMonster());
    }

}