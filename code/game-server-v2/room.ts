import { RoomId, JoinCode, AccountId } from "./types";
import { Player } from "./player";
import { TournamentManager } from "./tournament_manager";

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

  tournamentManager: TournamentManager = new TournamentManager()

  constructor(hostSocketId: string, roomId: RoomId, joinCode: JoinCode) {
    this.hostSocketId = hostSocketId;
    this.roomId = roomId;
    this.joinCode = joinCode;
  }

hasPlayer(displayName: string): boolean {
  return this.players.some(player => player.displayName === displayName);
}

getPlayer(displayName: string): Player | undefined {
  return this.players.find(player => player.displayName === displayName);
}

}
