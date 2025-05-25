import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { GameStates } from '../imports/api/DataBases';
import { check } from "meteor/check";
import "../imports/api/GameStateMethods";


const CODE_MIN_LENGTH = 6; // TODO use a global / db record
const CODE_ALPHABET = "0123456789";

/** Initialize new sqids object */
export const sqids = new Sqids({
  minLength: CODE_MIN_LENGTH,
  alphabet: CODE_ALPHABET,
});

Meteor.startup(async () => {
  // do something
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
