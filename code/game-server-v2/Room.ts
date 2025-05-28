import { RoomId, JoinCode, AccountId } from "./types";
import { Player } from "./Player";
import { GameSettings } from "./GameSettings";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";
import { Match } from "./Match";

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
  matches: Map<string, Match> = new Map<string, Match>();
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

  createMatch(player1: Player, player2: Player): Match {
    // Temporary way of assigning match an id
    const matchId = `${this.matches.size}`;
    const match = new Match(player1, player2, matchId);
    this.matches.set(matchId, match);
    return match;
  }

  createMatches() {
    /** TODO */
    // Choose matchup of players
    // Call createMatch on the two players
  }

  getMatch(matchId: string) {
    return this.matches.get(matchId);
  }
}
