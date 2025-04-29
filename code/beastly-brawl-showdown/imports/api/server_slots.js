import Sqids from 'sqids'

class Server {
    static MIN_CAPACITY = 1;
  
    constructor(server_no, maxCapacity) {
        // Ensure a minimum capacity
        const capacity = Math.max(Server.MIN_CAPACITY, maxCapacity);
        
        this.server_no = server_no    
        this.rooms = 0;
        this.currMax = 0;
        this.availableRoom = 0;
        this.roomArray = new Array(capacity).fill(null);
        this.useArray = new Array(capacity).fill(0);
    }
  
    createRoom() {
      if (this.isFull()) {
        throw new Error("Server is full");
      }

      const sqids = new Sqids({minLength: 6})
      const slotIndex = this.availableRoom;
      const roomUses = this.useArray[slotIndex]
      // Encode by [server number, room number, room no. of use]
      const roomId = sqids.encode([this.server_no, slotIndex, roomUses])
      this.roomArray[slotIndex] = roomId;
      this.rooms += 1;
      this.useArray[slotIndex] += 1;
  
      this.updateCurrentMax();
      this.updateAvailableSlot(slotIndex + 1);
  
      return roomId;
    }
  
    deleteRoom(roomId) {
      if (this.isEmpty()) {
        throw new Error("Server is empty");
      }
  
      if (this.roomArray[roomId] === null) {
        throw new Error("Slot is already empty");
      }
  
      this.roomArray[roomId] = null;
      this.rooms -= 1;
  
      this.updateAvailableSlot(roomId);
    }
  
    updateCurrentMax() {
      let current = this.currMax;
      for (let count of this.useArray) {
        if (count > current) {
          current = count;
        }
      }
      this.currMax = current;
    }
  
    updateAvailableSlot(startIndex) {
      const length = this.roomArray.length;
  
      // Case 1: Find a slot that is free and used less than currMax
      for (let i = 0; i < length; i++) {
        const index = (startIndex + i) % length;
        if (this.useArray[index] < this.currMax && this.roomArray[index] === null) {
          this.availableRoom = index;
          return;
        }
      }
  
      // Case 2: Check if all slots are used equally
      let allEqual = this.useArray.every((val) => val === this.currMax);
      if (!allEqual) {
        this.availableRoom = null;
        return;
      }
  
      // Case 3: All used equally – find any empty slot
      for (let i = 0; i < length; i++) {
        const index = (startIndex + i) % length;
        if (this.roomArray[index] === null) {
          this.availableRoom = index;
          return;
        }
      }
  
      this.availableRoom = null; // No available slots
    }
  
    isFull() {
      return this.rooms === this.roomArray.length || this.availableRoom === null;
    }
  
    isEmpty() {
      return this.rooms === 0;
    }
  
    get length() {
      return this.rooms;
    }
  }
  