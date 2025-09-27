import { RoomId, JoinCode, AccountId } from "./types";
import { Player } from "./player";
import { TournamentManager, TournamentType } from "./tournament_manager";

export class Room {
  readonly hostSocketId: string;

  readonly roomId: RoomId;
  /**
   * The code which players can join the room with.
   *
   * Generated from {@link roomId} using {@link Sqids}
   */
  readonly joinCode: JoinCode;

  players: Player[] = [];
  gameState: any = undefined;
  playerChannel: any;
  tournamentType: TournamentType;
  tournamentManager: TournamentManager;

  constructor(hostSocketId: string, roomId: RoomId, joinCode: JoinCode, playerChannel: any, tournamentType: TournamentType) {
    this.hostSocketId = hostSocketId;
    this.roomId = roomId;
    this.joinCode = joinCode;
    this.playerChannel = playerChannel;
    this.tournamentType = tournamentType;
    this.tournamentManager = new TournamentManager(this.playerChannel, tournamentType);
  }

  hasPlayer(displayName: string): boolean {
    return this.players.some(player => player.displayName === displayName);
  }

  getPlayer(displayName: string): Player | undefined {
    return this.players.find(player => player.displayName === displayName);
  }

  getMatchByPlayer(displayName: string) {
    return this.tournamentManager.matches.find(match => 
      match.player1.displayName === displayName || 
      (match.player2 && match.player2.displayName === displayName)
    );
  }

}
