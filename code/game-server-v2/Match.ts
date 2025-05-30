import { Player } from "./Player";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";
import { Action, MatchId } from "../shared/types";
import { Server } from "socket.io";

type SideData = {
  player: Player;
  monsterState: Monsters;
  pendingMove: any | null;
};

export type Match = DuelMatch | ByeMatch;

class BaseMatch {
  matchId: MatchId;
  constructor(matchId: MatchId) {
    this.matchId = matchId;
  }
}

export class ByeMatch extends BaseMatch {
  player: Player;

  constructor(matchId: MatchId, player: Player) {
    super(matchId);
    this.player = player;
  }
}

export class DuelMatch extends BaseMatch {
  sides: SideData[] = [];
  /** Converts a player into the side index */
  playerSideIndexLookup: Map<Player, number> = new Map<Player, number>();
  // // /** The match id that the winner goes to, if null this is the final */
  // // winnerNextMatchId: MatchId | null = null;
  // // /** The match id that the loser goes to, if null this player is eliminated. */
  // // loserNextMatchId: MatchId | null = null;

  constructor(matchId: MatchId, player1: Player, player2: Player) {
    super(matchId);

    // TODO - change into args of any length (argv style)
    const side1: SideData = {
      player: player1,
      monsterState: player1.getMonster()!,
      pendingMove: null,
    };
    this.sides.push(side1);
    this.playerSideIndexLookup.set(player1, this.sides.length);

    const side2: SideData = {
      player: player2,
      monsterState: player2.getMonster()!,
      pendingMove: null,
    };
    this.sides.push(side2);
    this.playerSideIndexLookup.set(player2, this.sides.length);
  }

  getEnemyByPlayer(player: Player): Player {
    /// TEMP
    const selfIndex = this.playerSideIndexLookup.get(player);
    if (!selfIndex) {
      throw new Error("Player not found in match");
    }

    if (selfIndex === 1) {
      return this.sides[0].player;
    } else {
      return this.sides[1].player;
    }
  }

  containsPlayer(player: Player): boolean {
    return this.playerSideIndexLookup.has(player);
  }

  /**
   * Clears the previous moves
   */
  clearMoves() {
    for (let i = 0; i < this.sides.length; i++) {
      this.sides[i].pendingMove = null;
    }
  }
}
