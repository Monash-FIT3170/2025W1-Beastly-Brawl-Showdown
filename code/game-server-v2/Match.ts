import { Player } from "./Player";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";
import { Action } from "./types";
import { Server } from "socket.io";

export class Match {
  
  matchId: string;
  player1: Player;
  player2: Player;
  // Need io but leave that to harshil to do - done

  /**
   * Things that need to be stored in match states:
   * - Monster's state
   * - Player's actions
   */
  // I'm guessing monster object's health will change as the match progresses

  /** Map for player and monsters */
  playerMonsters: Map<Player, Monsters | undefined> = new Map<Player,Monsters>();
  /** Map for player and their selected action */
  selectedMoves: Map<Player, Action> = new Map<Player, Action>();

  constructor(player1: Player, player2: Player, matchId: string) {
    this.player1 = player1;
    this.player2 = player2;
    this.matchId = matchId;
    this.playerMonsters.set(player1, player1.getMonster());
    this.playerMonsters.set(player2, player2.getMonster());
  }

  start(io: Server) {
    const monster1 = this.playerMonsters.get(this.player1);
    const monster2 = this.playerMonsters.get(this.player2);

    const player1Data = {
      matchId: this.matchId,
      you: { socketId: this.player1.socketId, displayName: this.player1.displayName, monster: monster1 },
      opponent: { socketId: this.player2.socketId, displayName: this.player2.displayName, monster: monster2 }
    };

    const player2Data = {
      matchId: this.matchId,
      you: { displayName: this.player2.displayName, monster: monster2 },
      opponent: { displayName: this.player1.displayName, monster: monster1 }
    };

    io.to(this.player1.socketId).emit("match-start", player1Data);
    io.to(this.player2.socketId).emit("match-start", player2Data);
  }
}
