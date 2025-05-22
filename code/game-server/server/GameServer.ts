import { Mongo } from "meteor/mongo";
import Sqids from "sqids";

export const GameServerRecords = new Mongo.Collection("game_server_records");

export class Player {
  displayName: string;
  linkedAcccountId?: string;

  constructor(displayName) {
    this.displayName = displayName;
  }

  /** Method to get the name of this player */
  getName() {
    return this.displayName;
  }

  /** Method to display player name when player object is printed */
  toString() {
    return this.displayName;
  }
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
  static MIN_CAPACITY = 1;
  static CODE_MIN_LENGTH = 6;
  static CODE_ALPHABET = "0123456789";
  
  server_no: number;
  numberOfRooms: number;
  currMax: number;
  availableRoom: number;
  rooms: Room[];
  uses: number[];

  constructor(server_no: number, maxCapacity: number) {
    /**  Ensure a minimum capacity */
    const capacity = Math.max(RoomServer.MIN_CAPACITY, maxCapacity);

    /** Server instance number */
    this.server_no = server_no;
    /**  Number of currently active rooms */
    this.numberOfRooms = 0;
    /**  Current highest number of times a room has been used */
    this.currMax = 0;
    /**  Index of the available room to be used next */
    this.availableRoom = 0;
    /**  The array to store rooms */
    this.rooms = new Array(capacity).fill(null);
    /**  The array to store the number of times each room has been used */
    this.uses = new Array(capacity).fill(0);
  }

  async registerServer() {
    /// attempt to write this to the
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
    const roomCode:string = sqids.encode([this.server_no, slotIndex, roomUses]);
    /** Create temporary room object with this room id */
    const room = new Room(); /** Temporary implementation of room object */
    room.roomCode = roomCode
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
  async deleteRoom(roomCode) {
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
      if (roomCode == this.rooms[i].getRoomId()) {
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

  async hasInstanceWithCode(roomCode) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i] == roomCode) {
        return true;
      }
    }
    return false;
  }
}
