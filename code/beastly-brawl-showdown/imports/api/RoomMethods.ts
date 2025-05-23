import { Meteor } from "meteor/meteor";
import { RoomServerManager } from "../../server/room/RoomServerManager";

Meteor.methods({
  async requestNewRoom() {
    // if (RoomServerManager.instance.test_single_instance.isFull()) { throw new Meteor.Error("No free slots remaining"); } 
    // TODO move this warning to be an error that is returned from the request below, the request should then the altered to handle and errors it gets passed
    const response = await RoomServerManager.requestNewRoomAllocation();
    console.log(`Room assigned: ${response.roomCode}`);
    return response;
  },

  async requestJoinRoom({ playerID, roomCode }: { playerID: number, roomCode: string }): Promise<{ submittedRoomCode: string, isValidCode: boolean }>
  { // player ID currently unused - maybe used later?
    var response = {
      submittedRoomCode: roomCode,
      isValidCode: false
    }
    console.log(`Player <${playerID}> attempted to join using code ${response.submittedRoomCode}`)

    const result = await RoomServerManager.requestPlayerJoinRoom({ roomCode: roomCode })
    response.isValidCode = result.isValidCode

    return response;
  }
})



