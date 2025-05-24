import { Meteor } from "meteor/meteor";
import { RoomServerManager } from "../../server/room/RoomServerManager";

Meteor.methods({
  async requestNewRoom() {
    const response = await RoomServerManager.requestNewRoomAllocation();
    console.log(`Room assigned: ${response.roomCode}`);

    try {
      await Meteor.callAsync("gameStates.initialize", response.roomCode);
      console.log(`Game state initialized for room ${response.roomCode}`);
    } catch (error) {
      console.error(`Failed to initialize game state for room ${response.roomCode}:`, error);
      throw new Meteor.Error("room-init-failed", "Failed to initialize room game state");
    }

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



