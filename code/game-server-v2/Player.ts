import { AccountId, RoomId } from "../shared/types";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";

/**
 * A set of data from which a player's information is stored.
 *
 * **Players are per room**
 */
export class Player {
  /** The ID the room belongs to. */
  roomId: RoomId;
  socketId: string;
  displayName: string;
  monster?: Monsters;
  linkedAcccountId?: AccountId;
  isReadyForGame?: boolean;

  /// Game stats
  byeCount: number = 0;
  winCount: number = 0;
  lossCount: number = 0;
  playerToSpectate: Player | null = null;

  constructor(roomId: RoomId, socketId: string, displayName: string, monster?: Monsters | undefined, linkedAcccountId?: AccountId | undefined) {
    this.roomId = roomId;
    this.socketId = socketId;
    this.displayName = displayName;
    this.monster = monster;
    this.linkedAcccountId = linkedAcccountId;
  }

  getMonster(): Monsters | undefined {
    return this.monster;
  }

  setMonster(monster: Monsters) {
    this.monster = monster;
  }
}
