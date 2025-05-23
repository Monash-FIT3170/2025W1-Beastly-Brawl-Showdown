import { assert, error } from "console";
import { Mongo } from "meteor/mongo";
import Sqids from "sqids";
import { log, log_warning } from "./utils";

export type ServerId = number;
export type RoomId = number;
export type JoinCode = string;

export const GameServerRecords = new Mongo.Collection("game_server_records");

export class Player {
  displayName?: string;
  linkedAcccountId?: string;
}

/** Preferences and Settings for this lobby */
export class GameSettings {}

export class Room {
  readonly roomId: RoomId;
  /**
   * The code which players can join the room with.
   *
   * Generated from {@link roomId} using {@link Sqids}
   */
  readonly joinCode: JoinCode;

  players: Array<Player> = new Array<Player>();
  gameState: any = undefined;
  settings: GameSettings = new GameSettings();

  constructor(roomId: RoomId, joinCode: JoinCode) {
    this.roomId = roomId;
    this.joinCode = joinCode;
  }
}

export class GamerServer {
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

  /**  The array to store rooms */
  private rooms = new Map<RoomId, Room>();

  private constructor(serverId: ServerId, maxCapacity: number) {
    if (serverId < 0) {
      throw Error("Invalid server id.");
    }
    this.serverId = serverId;

    if (maxCapacity <= 0) {
      throw Error("Invalid server capacity.");
    }
    this.maxCapacity = maxCapacity;
  }

  static async start(
    serverId: ServerId,
    maxCapacity: number
  ): Promise<GamerServer> {
    log("Starting server instance...");
    const gameServer: GamerServer = new GamerServer(serverId, maxCapacity);
    log("Register with global records...");
    await gameServer.registerServer(true);

    log("Server startup complete.");
    return gameServer;
  }

  /** Attempt to write this to the database */
  private async registerServer(overrideExisting: boolean) {
    /// Does this already exist in the records
    const existingRecord = await GameServerRecords.findOneAsync({
      serverNo: this.serverId,
    });
    if (existingRecord) {
      log_warning("There is a server registered with the same number.");
      if (!overrideExisting) {
        throw Error(
          "Server registration failed. Cannot override existing record."
        );
      }
      log_warning(
        `Overriding existing record: ${JSON.stringify(existingRecord)}`
      );
    }

    const noOfUpdatedRecords = await GameServerRecords.updateAsync(
      { serverNo: this.serverId },
      { $set: { url: process.env.ROOT_URL } },
      { upsert: true } /// Update or insert (if does not exist)
    );

    assert(
      noOfUpdatedRecords <= 1,
      "Unexpected behaviour. Multiple records overwritten when there should be one."
    );
  }

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

  // TODO AUTH
  createRoom() {
    if (this.isFull()) {
      throw new Error("Server is full.");
    }

    const newRoom: Room = new Room(
      this.peekNextRoomId(),
      this.sqids.encode([this.serverId, this.peekNextRoomId()])
    );

    if (this.rooms.has(newRoom.roomId)) {
      throw Error("Existing room has the same ID.");
    }
    this.rooms.set(newRoom.roomId, newRoom);
    this.popNextRoomId(); /// Increment once the room is saved
  }

  // TODO AUTH
  deleteRoom(roomId: RoomId) {
    if (this.countActiveRooms() == 0) {
      throw Error("Deletion failed, there are no rooms in this server");
    }

    if (!this.rooms.has(roomId)) {
      throw Error(`A room with ID = ${roomId} does not exist.`);
    }

    this.rooms.delete(roomId);
  }
}
