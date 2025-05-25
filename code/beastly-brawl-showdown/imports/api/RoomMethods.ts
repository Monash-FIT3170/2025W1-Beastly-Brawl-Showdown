import { Meteor } from "meteor/meteor";
import { RoomServerManager } from "../../server/room/RoomServerManager";

Meteor.methods({
  async requestNewRoom() {
    // if (RoomServerManager.instance.test_single_instance.isFull()) { throw new Meteor.Error("No free slots remaining"); } 
    // TODO move this warning to be an error that is returned from the request below, the request should then the altered to handle and errors it gets passed
    const response = await RoomServerManager.requestNewRoomAllocation();
    console.log(`Room assigned: ${response.joinCode}`);
    return response;
  },

  async requestJoinRoom({ playerID, joinCode }: { playerID: number, joinCode: string }): Promise<{ submittedjoinCode: string, isValidCode: boolean }>
  { // player ID currently unused - maybe used later?
    var response = {
      submittedjoinCode: joinCode,
      isValidCode: false
    }
    console.log(`Player <${playerID}> attempted to join using code ${response.submittedjoinCode}`)

    const result = await RoomServerManager.requestPlayerJoinRoom({ joinCode: joinCode })
    response.isValidCode = result.isValidCode

    return response;
  }
})



