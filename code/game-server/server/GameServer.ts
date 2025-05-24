import { assert, error } from "console";
import { Mongo } from "meteor/mongo";
import Sqids from "sqids";
import { log_notice, log_warning } from "./utils";

// TODO export to all apps
export type ServerId = number;
export type RoomId = number;
export type JoinCode = string;

export type AccountId = string;

export const GameServerRecords = new Mongo.Collection("game_server_records");

export class Player {
  displayName: string;
  linkedAcccountId?: AccountId;

  constructor(displayName: string, linkedAcccountId: AccountId | undefined) {
    this.displayName = displayName;
    this.linkedAcccountId = linkedAcccountId;
  }
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

  players: Map<string, Player> = new Map<string, Player>();
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
    log_notice("Starting server instance...");
    const gameServer: GamerServer = new GamerServer(serverId, maxCapacity);
    log_notice("Register with global records...");
    await gameServer.registerServer(true);

    log_notice("Server startup complete.");
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
      { $set: { serverUrl: process.env.ROOT_URL } },
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
  createRoom(): { roomId: RoomId; joinCode: JoinCode } {
    if (this.isFull()) {
      throw new Error("Server is full.");
    }

    const newRoom: Room = new Room(
      this.peekNextRoomId(),
      this.sqids.encode([this.serverId, this.peekNextRoomId()])
    );

    if (this.hasRoom(newRoom.roomId)) {
      throw Error("Existing room has the same ID.");
    }
    this.rooms.set(newRoom.roomId, newRoom);
    this.popNextRoomId(); /// Increment once the room is saved

    return { roomId: newRoom.roomId, joinCode: newRoom.joinCode };
  }

  // TODO AUTH
  deleteRoom(roomId: RoomId) {
    if (this.countActiveRooms() == 0) {
      throw Error("Deletion failed, there are no rooms in this server");
    }

    if (!this.hasRoom(roomId)) {
      throw Error(`A room with ID = ${roomId} does not exist.`);
    }

    this.rooms.delete(roomId);
  }

  translateJoinCodeToRoomId(joinCode: JoinCode) {
    return this.sqids.decode(joinCode)[1]; /// We already know the server id (of this)
  }

  hasRoom(roomId: RoomId): boolean {
    return this.rooms.has(roomId);
  }

  joinRoom(
    roomId: RoomId,
    displayName: string,
    linkedAcccountId: AccountId | undefined
  ) {
    //TODO validate input

    const room: Room = this.rooms.get(roomId)!;
    if (!room) {
      throw new Error("Invalid room id.");
    }

    if (room.players.has(displayName)) {
      throw new Error("Display name already taken.");
    }

    const newPlayer = new Player(displayName, linkedAcccountId);
    room.players.set(displayName, newPlayer);
  }
}
