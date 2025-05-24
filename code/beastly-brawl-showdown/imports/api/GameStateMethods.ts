import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { GameStates } from "./GameStates";

Meteor.methods({
  async "gameStates.initialize"(roomId: string) {
    console.log("Setting phase:", roomId); // debugging line

    check(roomId, String);
    try {
      console.log(`[Server] Initializing phase to 'waiting' for roomId: ${roomId}`);
      await GameStates.upsertAsync(
        { roomId },
        {
          $set: { phase: "waiting" }, // forcibly reset phase every time
          $setOnInsert: { createdAt: new Date() },
        }
      );
      console.log(`[Server] Game state for room ${roomId} initialized or reset to 'waiting'`);
    } catch (err) {
      console.error(`[Server] Error initializing game state for room ${roomId}:`, err);
      throw new Meteor.Error("upsert-failed", "Failed to initialize game state");
    }
  },

  async "gameStates.setPhase"(roomId: string, phase: string) {
    console.log("Setting phase:", roomId, phase); // debugging line

    check(roomId, String);
    check(phase, String);
    try {
      console.log(`[Server] Setting phase to '${phase}' for roomId: ${roomId}`);
      await GameStates.upsertAsync(
        { roomId },
        {
          $set: { phase },
          $setOnInsert: { createdAt: new Date() },
        }
      );
      console.log(`[Server] Updated phase for room ${roomId} to '${phase}'`);
    } catch (err) {
      console.error(`[Server] Error setting phase for room ${roomId}:`, err);
      throw new Meteor.Error("upsert-failed", "Failed to update phase");
    }
  },
});
