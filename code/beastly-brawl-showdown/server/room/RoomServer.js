"use strict";

import Sqids from "sqids";

export class RoomServer {
  static MIN_CAPACITY = 1;
  static CODE_MIN_LENGTH = 6;
  static CODE_ALPHABET = "0123456789";

  constructor(server_no, maxCapacity) {
    // Ensure a minimum capacity
    const capacity = Math.max(RoomServer.MIN_CAPACITY, maxCapacity);

    this.server_no = server_no;
    // Number of currently active rooms
    this.numberOfRooms = 0;
    // Current highest number of times a room has been used
    this.currMax = 0;
    // Index of the available room to be used next
    this.availableRoom = 0;
    // The array to store rooms
    this.rooms = new Array(capacity).fill(null);
    // The array to store the number of times each room has been used
    this.uses = new Array(capacity).fill(0);
  }

  // Create room
  async createRoom() {
    if (this.isFull()) {
      throw new Error("Server is full");
    }

    // Initialize new sqids object
    const sqids = new Sqids({ minLength: RoomServer.CODE_MIN_LENGTH, alphabet: RoomServer.CODE_ALPHABET });
    // Get the index of the room to be created
    const slotIndex = this.availableRoom;
    // Get the number of uses for this room
    const roomUses = this.uses[slotIndex];
    // Encode by [server number, room number, room no. of use]
    const roomId = sqids.encode([this.server_no, slotIndex, roomUses]);
    // Create temporary room object with this room id
    const room = {Id: roomId}; // Temporary implementation of room object
    // Assign room to slot
    this.rooms[slotIndex] = room;
    // Increment the number of currently active rooms
    this.numberOfRooms++;
    // Increment the number of uses of this room
    this.uses[slotIndex]++;

    // Update the currMax
    this.updateCurrentMax();
    // Update the next available slot
    this.updateAvailableSlot(slotIndex + 1);

    return room.Id;
  }

  // Delete room
  async deleteRoom(roomId) {
    if (this.isEmpty()) {
      throw new Error("Server is empty");
    }

    if (this.rooms[roomId] === null) {
      throw new Error("Slot is already empty");
    }

    // Clear the room
    this.rooms[roomId] = null;
    // Decrement the number of rooms
    this.numberOfRooms -= 1;

    // Update the next available slot
    this.updateAvailableSlot(roomId);
  }

  // Update the current highest number of times a room has been used
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

  // Looks for the next available slot
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

  // Returns true if no rooms available
  isFull() {
    return this.numberOfRooms === this.rooms.length || this.availableRoom === null;
  }

  // Returns true if there are no rooms being used
  isEmpty() {
    return this.numberOfRooms === 0;
  }

  // Get number of rooms being used
  get length() {
    return this.numberOfRooms;
  }

  async hasInstanceWithCode(code) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i] == code) { return true; }
    }
    return false;
  }
}
