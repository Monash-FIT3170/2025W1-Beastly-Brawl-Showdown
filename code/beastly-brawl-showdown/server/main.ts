import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { GameStates, Players } from '../imports/api/DataBases';
import { check } from "meteor/check";
import "../imports/api/GameStateMethods";


const CODE_MIN_LENGTH = 6; // TODO use a global / db record
const CODE_ALPHABET = "0123456789";

/** Initialize new sqids object */
export const sqids = new Sqids({
  minLength: CODE_MIN_LENGTH,
  alphabet: CODE_ALPHABET,
});

Meteor.publish("playersByRoom", function (roomId: string) {
  check(roomId, String);
  return Players.find({ roomId });
});

Meteor.startup(async () => {
  // do something
});

});

Meteor.methods({
  async "players.checkAllConfirmed"(roomId: string) {
    check(roomId, String);
    
    const playersInRoom = await Players.find({ roomId }).fetchAsync();
    if (playersInRoom.length === 0) {
      throw new Meteor.Error("no-players", "No players in this room");
    }

    const allConfirmed = playersInRoom.every(p => p.monster && p.confirmed);
    
    if (allConfirmed) {
      // Automatically move to battle phase
      await Meteor.callAsync("gameStates.setPhase", roomId, "battle");
    }

    return allConfirmed;
  },

  async "players.save"(roomId: string, playerData: any) {
    check(roomId, String);
    check(playerData, {
      playerId: String,
      displayName: String,
    });

    const existing = await Players.findOneAsync({ roomId, playerId: playerData.playerId });
    if (existing) return playerData.playerId;

    await Players.insertAsync({
      roomId,
      playerId: playerData.playerId,
      displayName: playerData.displayName,
      monster: null,
      confirmed: false,
    });

    return playerData.playerId;
  },
});
