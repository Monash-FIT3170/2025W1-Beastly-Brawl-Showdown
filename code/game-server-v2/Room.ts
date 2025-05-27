import { RoomId, JoinCode, AccountId } from "./types";
import { Player } from "./Player";
import { GameSettings } from "./GameSettings";

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

  constructor(hostSocketId: string, roomId: RoomId, joinCode: JoinCode) {
    this.hostSocketId = hostSocketId;
    this.roomId = roomId;
    this.joinCode = joinCode;
  }

  hasPlayer(displayName: string) {
    return this.players.has(displayName);
  }
}
