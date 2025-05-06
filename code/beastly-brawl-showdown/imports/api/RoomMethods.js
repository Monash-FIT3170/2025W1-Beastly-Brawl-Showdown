"use strict";

import { Meteor } from "meteor/meteor";
import { RoomServerManager } from "../../server/room/RoomServerManager";

Meteor.methods({
  async requestNewRoom() {
    if (RoomServerManager.instance.test_single_instance.isFull()) { throw new Meteor.Error("No free slots remaining"); }
    
    const response = await RoomServerManager.requestRoomToHost();
    console.log(`Room assigned: ${response.roomCode}`);
    return response;
  },

  joinRoom({ playerID, roomCode }) {
    var response = {
      submittedRoomCode: roomCode,
      isValidCode: false
    }
    console.log(`Player <${playerID}> attempted to join using code ${response.submittedRoomCode}`)

    if (!isValidRoomCode(roomCode)) { return response } else { response.isValidCode = true; }

    return response;
  }
})



