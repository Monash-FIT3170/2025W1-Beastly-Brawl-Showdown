import { assert } from "console";
import { Mongo } from "meteor/mongo";
import Sqids from "sqids";

export const GameServerRecords = new Mongo.Collection("game_server_records");

export class Player {
  displayName: string | null = null;
  linkedAcccountId: string | null = null;
}

/** Turn history */
export class MatchState {}
/** Preferences and Settings for this lobby */
export class GameSettings {}

export class Room {
  players: Array<Player>;
  gameState: Array<MatchState>;
  settings: GameSettings;

  roomCode: string | null = null;

  constructor() {
    this.settings = {};
    this.players = []; // Temporarily have no limit to the number of players
    this.gameState = [];
  }
}

export class RoomServer {
  static readonly CODE_MIN_LENGTH = 6;
  static readonly CODE_ALPHABET = "0123456789";

  /** The assigned server number */
  readonly serverNo: number;
  /** Max number of slots */
  readonly capacity: number;

  /**  Number of currently active rooms */
  numberOfRooms: number;
  /**  Current highest number of times a room has been used */
  currMax: number;
  /**  Index of the available room to be used next */
  availableRoom: number;
  /**  The array to store rooms */
  rooms: Room[];
  /**  The array to store the number of times each room has been used */
  uses: number[];

  constructor(serverNo: number, maxCapacity: number) {
    this.serverNo = serverNo;
    assert(maxCapacity > 0, "Ensure a minimum capacity");
    this.capacity = maxCapacity;

    this.numberOfRooms = 0;
    this.currMax = 0;
    this.availableRoom = 0;
    this.rooms = new Array(this.capacity).fill(null);
    this.uses = new Array(this.capacity).fill(0);
  }

  /** Attempt to write this to the database */
  async registerServer(overrideExisting: boolean) {
    /// Does this already exist in the records
    const existingRecord = await GameServerRecords.findOneAsync({
      serverNo: this.serverNo,
    });

    if (existingRecord) {
      console.log("There is a server registered with the same number.");
      if (!overrideExisting) {
        throw Error(
          "Server registration failed. Cannot override existing record."
        );
      }
      console.log(
        `Overriding existing record: ${JSON.stringify(existingRecord)}`
      );
    }

    const noOfUpdatedRecords = await GameServerRecords.updateAsync(
      { serverNo: this.serverNo },
      { $set: { url: process.env.ROOT_URL } },
      { upsert: true } /// Update or insert (if does not exist)
    );

    assert(
      noOfUpdatedRecords <= 1,
      "Unexpected behaviour. Multiple records overrited when there should be one."
    );
  }

  /** Create room */
  async createRoom() {
    if (this.isFull()) {
      throw new Error("Server is full");
    }

    /** Initialize new sqids object */
    const sqids = new Sqids({
      minLength: RoomServer.CODE_MIN_LENGTH,
      alphabet: RoomServer.CODE_ALPHABET,
    });
    /** Get the index of the room to be created */
    const slotIndex = this.availableRoom;
    /** Get the number of uses for this room */
    const roomUses = this.uses[slotIndex];
    /** Encode by [server number, room number, room no. of use] */
    const roomCode: string = sqids.encode([this.serverNo, slotIndex, roomUses]);
    /** Create temporary room object with this room id */
    const room = new Room(); /** Temporary implementation of room object */
    room.roomCode = roomCode;
    /** Assign room to slot */
    this.rooms[slotIndex] = room;
    /** Increment the number of currently active rooms */
    this.numberOfRooms++;
    /** Increment the number of uses of this room */
    this.uses[slotIndex]++;

    /** Update the currMax */
    this.updateCurrentMax();
    /** Update the next available slot */
    this.updateAvailableSlot(slotIndex + 1);

    return room.roomCode;
  }

  /** Delete room */
  deleteRoom(roomCode) {
    /** Check if the room is empty */
    if (this.isEmpty()) {
      throw new Error("Server is empty");
    }

    /** Check if there is a room with this code */
    if (!this.hasInstanceWithCode(roomCode)) {
      throw new Error("Room not found");
    }

    /** Variable for the deleted index */
    let deletedIndex = null;
    // Find the room with this roomId
    for (let i = 0; i < this.length; i++) {
      if (roomCode == this.rooms[i].roomCode) {
        // Clear the room with the requested id
        this.rooms[i] = null;
        // Save the index of the deleted room
        deletedIndex = i;
      }
    }

    // Safety check
    if (deletedIndex === null) {
      throw new Error("Somehow bypassed the first error check");
    }

    // Decrement the number of rooms
    this.numberOfRooms -= 1;

    // Update the next available slot
    this.updateAvailableSlot(deletedIndex);
  }

  /** Update the current highest number of times a room has been used  */
  updateCurrentMax() {
    let current = this.currMax;
    // Look for max
    for (let count of this.uses) {
      if (count > current) {
        current = count;
      }
    }
    // Update variable to max
    this.currMax = current;
  }

  /** Looks for the next available slot */
  updateAvailableSlot(startIndex) {
    const length = this.rooms.length;

    // Case 1: Find a slot that is free and used less than currMax
    for (let i = 0; i < length; i++) {
      const index = (startIndex + i) % length;
      if (this.uses[index] < this.currMax && this.rooms[index] === null) {
        this.availableRoom = index;
        return;
      }
    }

    // Case 2: Check if all slots are used equally
    let allEqual = this.uses.every((val) => val === this.currMax);
    if (!allEqual) {
      this.availableRoom = null;
      return;
    }

    // Case 3: All used equally – find any empty slot
    for (let i = 0; i < length; i++) {
      const index = (startIndex + i) % length;
      if (this.rooms[index] === null) {
        this.availableRoom = index;
        return;
      }
    }

    this.availableRoom = null; // No available slots
  }

  /** Returns true if no rooms available */
  isFull() {
    return (
      this.numberOfRooms === this.rooms.length || this.availableRoom === null
    );
  }

  /** Returns true if there are no rooms being used */
  isEmpty() {
    return this.numberOfRooms === 0;
  }

  /** Get number of rooms being used */
  get length() {
    return this.numberOfRooms;
  }

  hasInstanceWithCode(roomCode) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i] == roomCode) {
        return true;
      }
    }
    return false;
  }
}
