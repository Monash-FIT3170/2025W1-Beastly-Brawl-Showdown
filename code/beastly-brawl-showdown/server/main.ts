import { Meteor } from 'meteor/meteor';
import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { GameStates } from '/imports/api/GameStates';
import { check } from "meteor/check";

Meteor.publish("gameStatesByRoom", function (roomId: string) {
  check(roomId, String);
  return GameStates.find({ roomId });
});

Meteor.startup(async () => {
  new RoomServerManager()

});

Meteor.methods({
  async initialize(roomId: string) {
    check(roomId, String);

    // Upsert a new gameState with default phase 'waiting' only if not exists
    const result = await GameStates.upsertAsync(
      { roomId },
      {
        $setOnInsert: {
          phase: "waiting",
          createdAt: new Date(),
        }
      }
    );

    console.log(`Initialized game state for roomId: ${roomId}`, result);
  },

  async setPhase(roomId: string, phase: string) {
    check(roomId, String);
    check(phase, String);

    const result = await GameStates.updateAsync(
      { roomId },
      { $set: { phase } },
      { upsert: true }
    );

    console.log(`Updated phase to "${phase}" for roomId: ${roomId}`, result);
  },
});
