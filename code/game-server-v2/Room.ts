import { RoomId, JoinCode, AccountId } from "./types";
import { Player } from "./Player";
import { GameSettings } from "./GameSettings";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";

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
}
