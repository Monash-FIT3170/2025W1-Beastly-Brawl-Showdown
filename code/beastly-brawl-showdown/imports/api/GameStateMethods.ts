import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { GameStates } from "./GameStates";

Meteor.methods({
  async "gameStates.initialize"(roomId: string) {
    check(roomId, String);
    try {
      await GameStates.upsertAsync(
        { roomId },
        {
          $setOnInsert: { phase: "waiting", createdAt: new Date() },
        }
      );
      console.log(`Game state for room ${roomId} initialized to 'waiting'`);
    } catch (err) {
      console.error("Error initializing game state:", err);
      throw new Meteor.Error("upsert-failed", "Failed to initialize game state");
    }
  },
  async "gameStates.setPhase"(roomId: string, newPhase: string) {
    check(roomId, String);
    check(newPhase, String);
    try {
      await GameStates.upsertAsync(
        { roomId },
        {
          $set: { phase: newPhase },
          $setOnInsert: { createdAt: new Date() },
        }
      );
      console.log(`Updated game phase for room ${roomId} to ${newPhase}`);
    } catch (err) {
      console.error("Error updating phase:", err);
      throw new Meteor.Error("upsert-failed", "Failed to update phase");
    }
  },
});
