import { Meteor } from "meteor/meteor";
import { gameServer } from "../../server/main";
import { AccountId, JoinCode, RoomId } from "../../server/types";
import { Room } from "/server/Room";
import { log_notice } from "/server/utils";

Meteor.methods({
  ping() {
    return "pong!";
  },

  requestNewRoom() {
    if (!gameServer) {
      throw new Error("Server not started.");
    }

    if (gameServer.isFull()) {
      throw new Error("Server is full.");
    }

    const newRoomInfo = gameServer.createRoom();
    console.log(
      `Room assigned: Slot #${newRoomInfo.roomId} - Code: ${newRoomInfo.joinCode}`
    );
    return newRoomInfo;
  },

  checkHasJoinableRoom(joinCode: JoinCode): boolean {
    const roomId: RoomId = gameServer.translateJoinCodeToRoomId(joinCode);
    return gameServer.hasRoom(roomId);
  },

  requestJoinRoom(
    joinCode: JoinCode,
    displayName: string,
    acccountId?: AccountId
  ) {
    const roomId = gameServer.translateJoinCodeToRoomId(joinCode);

    console.log(
      `Player <${displayName}> attempted to join using code <${joinCode}> (room id <${roomId}>) with account id <${acccountId}>`
    );

    gameServer.joinRoom(roomId, displayName, acccountId);
    log_notice(
      `Player <${displayName}> joined room <${roomId}> with account id <${acccountId}>`
    );
  },
});
