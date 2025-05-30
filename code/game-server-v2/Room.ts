import { RoomId, JoinCode, AccountId, MatchId } from "../shared/types";
import { Player } from "./Player";
import { GameSettings } from "./GameSettings";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";
import { ByeMatch, DuelMatch, Match } from "./Match";

export class Room {
  readonly hostSocketId: string;

  readonly roomId: RoomId;
  /**
   * The code which players can join the room with.
   *
   * Generated from {@link roomId} using {@link Sqids}
   */
  readonly joinCode: JoinCode;

  players: Map<string, Player> = new Map<string, Player>(); // <displayName, Player> temporarily
  gameState: any = undefined;
  settings: GameSettings = new GameSettings();
  matches: Match[][] = [];
  // matches: Map<MatchId, Match> = new Map<MatchId, Match>();
  playerToMatch: Map<Player, Match> = new Map<Player, Match>();

  constructor(hostSocketId: string, roomId: RoomId, joinCode: JoinCode) {
    this.hostSocketId = hostSocketId;
    this.roomId = roomId;
    this.joinCode = joinCode;
  }

  hasPlayer(displayName: string): boolean {
    return this.players.has(displayName);
  }

  /**
   * Gives the desired player the monster they choose
   * @param displayName name of the player
   * @param monster name of monster they wish to select
   */
  setMonster(displayName: string, monster: Monsters) {
    let changedPlayer = this.players.get(displayName);
    if (changedPlayer) {
      changedPlayer.monster = monster;
    }
  }

  /**
   * Adds player
   * @param player player to add
   */
  addPlayer(player: Player) {
    this.players.set(player.displayName, player);
  }

  // createMatch(matchId: MatchId, player1: Player, player2: Player): Match {
  //   const match = new Match(matchId, player1, player2);
  //   this.matches.set(matchId, match);
  //   return match;
  // }

  // createMatches() {
  //   /** TODO */
  //   // Choose matchup of players
  //   // Call createMatch on the two players
  //   const playerList = Array.from(this.players.values());
  //   for (let i = 0; i < playerList.length - 1; i += 2) {
  //     //right now its just first player vs second player and so on (3vs4, 5vs6), ig if you wanted it to be different (1v5) could always just shuffle the array beforehand
  //     const player1 = playerList[i];
  //     const player2 = playerList[i + 1];
  //     //for now match id is just the order of match creation, does it have to be a fancy String for some reason?
  //     const matchId = i / 2 + 1;

  //     this.createMatch(matchId, player1, player2);
  //   }
  //   if (playerList.length % 2 != 0) {
  //     console.log("The last player in the playerlist won't be matched with anybody");
  //   }
  // }

  generateNextRound() {
    const playersToAssign: Player[] = Array.from(this.players.values()).filter((player) => player.lossCount <= 0); /// Get all players that have not lost yet
    const newRound: Match[] = [];
    let matchesGenerated = 0;

    let byeIndex: number | null = null;
    if (playersToAssign.length % 2 != 0) {
      byeIndex = 0;
      /// Assign as bye (get the user with the lowest byes taken)
      for (let i = 0; i < playersToAssign.length; i++) {
        if (playersToAssign[i].byeCount < byeIndex) {
          byeIndex = i;
        }
      }
      /// Assign to bye match
      newRound.push(new ByeMatch(matchesGenerated, playersToAssign[byeIndex]));
      matchesGenerated++;
    }

    let playerPending: Player | null = null;
    for (let i = 0; i < playersToAssign.length; i++) {
      if (i == byeIndex) {
        continue; /// Skip bye
      }

      if (!playerPending) {
        playerPending = playersToAssign[i];
        continue;
      }

      // Make new match with playerPending and playersToAssign[i]
      newRound.push(new DuelMatch(matchesGenerated, playerPending, playersToAssign[i]));
      matchesGenerated++;
    }
    this.matches.push(newRound);
  }

  getMatch(roundNumber: number, matchId: MatchId) {
    return this.matches[roundNumber][matchId];
  }
}
