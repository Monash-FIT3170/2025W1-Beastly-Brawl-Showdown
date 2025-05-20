"use strict";

import Sqids from "sqids";
import { Room } from "./Room";

export class RoomServer {
  static MIN_CAPACITY = 1;
  static CODE_MIN_LENGTH = 6;
  static CODE_ALPHABET = "0123456789";

  /** Server instance number */
  private server_no: number;
  /**  Number of currently active rooms */
  private numberOfRooms: number = 0;
  /**  Current highest number of times a room has been used */
  private currMax: number = 0;
  /**  Index of the available room to be used next */
  private availableRoom: number | null = 0;
  /**  The array to store rooms */
  private rooms: (Room | null)[];
  /**  The array to store the number of times each room has been used */
  private uses: number[];

  constructor(server_no: number, maxCapacity: number) {
    /**  Ensure a minimum capacity */
    const capacity = Math.max(RoomServer.MIN_CAPACITY, maxCapacity);
    /** Server instance number */
    this.server_no = server_no;
    /**  The array to store rooms */
    this.rooms = new Array(capacity).fill(null);
    /**  The array to store the number of times each room has been used */
    this.uses = new Array(capacity).fill(0);
  }

  /** Create room */
  async createRoom(): Promise<string> {
  if (this.isFull()) {
    throw new Error("Server is full");
  }

  // Safety check since availableRoom could be null
  if (this.availableRoom === null) {
    throw new Error("No available room slot");
  }

  /** Initialize new sqids object */
  const sqids: Sqids = new Sqids({
    minLength: RoomServer.CODE_MIN_LENGTH,
    alphabet: RoomServer.CODE_ALPHABET
  });

  /** Get the index of the room to be created */
  const slotIndex: number = this.availableRoom;
  /** Get the number of uses for this room */
  const roomUses: number = this.uses[slotIndex];
  /** Encode by [server number, room number, room no. of use] */
  const roomCode: string = sqids.encode([this.server_no, slotIndex, roomUses]);

  /** Create temporary room object with this room id */
  const room: Room = new Room(roomCode);
  /** Assign room to slot */
  this.rooms[slotIndex]  = room;
  /** Increment the number of currently active rooms */
  this.numberOfRooms++;
  /** Increment the number of uses of this room */
  this.uses[slotIndex]++;

  /** Update the currMax */
  this.updateCurrentMax();
  /** Update the next available slot */
  this.updateAvailableSlot(slotIndex + 1);

  return room.getRoomCode();
}

  /** Delete room */
  async deleteRoom(roomCode: string): Promise<void> {
    /** Check if the room is empty */
    if (this.isEmpty()) {
      throw new Error("Server is empty");
    }

    /** Check if there is a room with this code */
    if (!(await this.hasInstanceWithCode(roomCode))) {
      throw new Error("Room not found");
    }

    /** Index of the room to be deleted */
    let deletedIndex: number | null = null;

    /** Look for the room's index */
    for (let i = 0; i < this.length; i++) {
      const room = this.rooms[i];
      if (room && room.getRoomCode() === roomCode) {
        this.rooms[i] = null;
        deletedIndex = i;
      }
    }

    /** Safety check */
    if (deletedIndex === null) {
      throw new Error("Somehow bypassed the first error check");
    }

    /** Decrement the number of rooms */
    this.numberOfRooms--;
    /** Update the next available slot */
    this.updateAvailableSlot(deletedIndex);
  }

  /** Update the current highest number of times a room has been used  */
  private updateCurrentMax(): void {
    let current = this.currMax;
    /** Look for max */
    for (let count of this.uses) {
      if (count > current) {
        current = count;
      }
    }
    this.currMax = current;
  }

  /** Looks for the next available slot */
  private updateAvailableSlot(startIndex: number): void {
    const length: number = this.rooms.length;

    /** Case 1: Find a slot that is free and used less than currMax  */
    for (let i = 0; i < length; i++) {
      const index = (startIndex + i) % length;
      if (this.uses[index] < this.currMax && this.rooms[index] === null) {
        this.availableRoom = index;
        return;
      }
    }

    /** Case 2: Check if all slots are used equally */
    const allEqual = this.uses.every((val) => val === this.currMax);
    if (!allEqual) {
      this.availableRoom = null;
      return;
    }

    /** Case 3: All used equally – find any empty slot */
    for (let i = 0; i < length; i++) {
      const index = (startIndex + i) % length;
      if (this.rooms[index] === null) {
        this.availableRoom = index;
        return;
      }
    }

    /** No available slots */
    this.availableRoom = null;
  }

  /** Returns true if no rooms available */
  isFull(): boolean {
    return this.numberOfRooms === this.rooms.length || this.availableRoom === null;
  }

  /** Returns true if there are no rooms being used */
  isEmpty(): boolean {
    return this.numberOfRooms === 0;
  }

  /** Get number of rooms being used */
  get length(): number {
    return this.numberOfRooms;
  }

  async hasInstanceWithCode(roomCode: string): Promise<boolean> {
    for (let room of this.rooms) {
      if (room && room.getRoomCode() === roomCode) {
        return true;
      }
    }
    return false;
  }
}
