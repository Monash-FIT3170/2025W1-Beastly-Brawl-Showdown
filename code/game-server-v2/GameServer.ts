import Sqids from "sqids";
import { log_notice, log_warning } from "../shared/utils";
import { Room } from "./Room";
import { Player } from "./Player";
import { ServerId, RoomId, JoinCode, AccountId } from "../shared/types";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters";

export class GameServer {
  readonly CODE_MIN_LENGTH = 6; // TODO move to argv
  readonly CODE_ALPHABET = "0123456789"; // TODO move to argv

  /** The assigned server number */
  readonly serverId: ServerId;
  /** Max number of slots */
  readonly maxCapacity: number;

  /** Initialize new sqids object */
  readonly sqids = new Sqids({
    minLength: this.CODE_MIN_LENGTH,
    alphabet: this.CODE_ALPHABET,
  });

  /**  The last room id that was given out */
  private lastAssignedRoomId: RoomId = 0;

  hostIdToRoomIdLookup = new Map<string, RoomId>();
  /**  The array to store rooms */
  rooms = new Map<RoomId, Room>();

  constructor(serverId: ServerId, maxCapacity: number) {
    if (serverId < 0) {
      throw new Error("Invalid server id.");
    }
    this.serverId = serverId;

    if (maxCapacity <= 0) {
      throw new Error("Invalid server capacity.");
    }
    this.maxCapacity = maxCapacity;
  }

  // /** Attempt to write this to the database */
  // private async registerServer(overrideExisting: boolean) {
  //   /// Does this already exist in the records
  //   const existingRecord = await GameServerRecords.findOneAsync({
  //     serverNo: this.serverId,
  //   });
  //   if (existingRecord) {
  //     log_warning("There is a server registered with the same number.");
  //     if (!overrideExisting) {
  //       throw new Error(
  //         "Server registration failed. Cannot override existing record."
  //       );
  //     }
  //     log_warning(
  //       `Overriding existing record: ${JSON.stringify(existingRecord)}`
  //     );
  //   }

  //   const noOfUpdatedRecords = await GameServerRecords.updateAsync(
  //     { serverNo: this.serverId },
  //     { $set: { serverUrl: process.env.ROOT_URL } },
  //     { upsert: true } /// Update or insert (if does not exist)
  //   );

  //   assert(
  //     noOfUpdatedRecords <= 1,
  //     "Unexpected behaviour. Multiple records overwritten when there should be one."
  //   );
  // }

  private peekNextRoomId(): RoomId {
    return this.lastAssignedRoomId + 1;
  }
  private popNextRoomId(): RoomId {
    this.lastAssignedRoomId = this.peekNextRoomId();
    return this.lastAssignedRoomId;
  }

  countActiveRooms(): number {
    return this.rooms.size;
  }

  isFull(): boolean {
    if (this.countActiveRooms() > this.maxCapacity) {
      log_warning("Server over capacity.");
    }
    return this.countActiveRooms() >= this.maxCapacity;
  }

  createRoom(hostSocketId: string): { roomId: RoomId; joinCode: JoinCode } {
    if (this.isFull()) {
      throw new Error("Server is full.");
    }

    const newRoom: Room = new Room(
      hostSocketId,
      this.peekNextRoomId(),
      this.sqids.encode([this.serverId, this.peekNextRoomId()]),
    );

    if (this.hasRoom(newRoom.roomId)) {
      throw new Error("Existing room has the same ID.");
    }
    this.rooms.set(newRoom.roomId, newRoom);
    this.hostIdToRoomIdLookup.set(hostSocketId, newRoom.roomId);
    this.popNextRoomId(); /// Increment once the room is saved

    return { roomId: newRoom.roomId, joinCode: newRoom.joinCode };
  }

  // // TODO AUTH
  // deleteRoom(roomId: RoomId) {
  //   if (this.countActiveRooms() == 0) {
  //     throw new Error("Deletion failed, there are no rooms in this server");
  //   }

  //   if (!this.hasRoom(roomId)) {
  //     throw new Error(`A room with ID = ${roomId} does not exist.`);
  //   }

  //   this.rooms.delete(roomId);
  // }

  translateJoinCodeToRoomId(joinCode: JoinCode) {
    return this.sqids.decode(joinCode)[1]; /// We already know the server id (of this)
  }

  hasRoom(roomId: RoomId): boolean {
    return this.rooms.has(roomId);
  }

  joinRoom(
    socketId: string,
    roomId: RoomId,
    displayName: string,
    monster: Monsters | undefined,
    linkedAcccountId: AccountId | undefined,
  ) {
    //TODO validate input

    const room: Room = this.rooms.get(roomId)!;
    if (!room) {
      throw new Error("Invalid room id.");
    }

    if (room.hasPlayer(displayName)) {
      throw new Error("Display name already taken.");
    }

    const newPlayer = new Player(
      socketId,
      displayName,
      monster,
      linkedAcccountId,
    );
    room.players.set(displayName, newPlayer);
  }
}
