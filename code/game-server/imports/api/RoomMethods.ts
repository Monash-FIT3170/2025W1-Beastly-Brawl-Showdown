import { Meteor } from "meteor/meteor";

import {roomServer as rs} from "../../server/main"

Meteor.methods({
  async requestNewRoom() {
    if(!rs) {throw Error("Server not started");}

    // if (RoomServerManager.instance.test_single_instance.isFull()) { throw new Meteor.Error("No free slots remaining"); }
    // TODO move this warning to be an error that is returned from the request below, the request should then the altered to handle and errors it gets passed
    const response = rs.createRoom().then();
    console.log(`Room assigned: ${response}`);
    return response;
  },

  async requestJoinRoom({ playerID, roomCode }) {
    // player ID currently unused - maybe used later?
    var response = {
      submittedRoomCode: roomCode,
      isValidCode: false,
    };
    console.log(
      `Player <${playerID}> attempted to join using code ${response.submittedRoomCode}`
    );

    response.isValidCode = await rs.join({
      roomCode: roomCode,
    });

    return response;
  }
});
