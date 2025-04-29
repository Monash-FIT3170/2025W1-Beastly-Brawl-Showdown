import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const RoomCollection = new Mongo.Collection("rooms");

//! Temporary constants -> move to be read from config 
const MAX_SERVER_SLOTS = 5;

let serverSlots = [];

function generateRoomCode() {
  //placeholder function for later on putting in the actual room code logic
  return 123456
}
function requestNewRoomInstance() {
  return { roomCode: generateRoomCode() }
}

function isFreeSlotExists() {
  return true;
}

function isValidRoomCode(roomCode) {
  return roomCode == 123456
}

Meteor.methods({
  async ping() { return "pong" },

  async createRoom() {
    // const roomId = await RoomCollection.insertAsync({
    //   roomCode: generateRoomCode(),
    // });
    // return RoomCollection.findOneAsync(roomId);
    if (!isFreeSlotExists()) { throw new Meteor.Error("No free slots remaining"); }

    return requestNewRoomInstance();
  },

  // async joinRoom({ accountID, roomCode }) {
  async joinRoom({ playerID, roomCode }) {
    var response = {
      submittedRoomCode: roomCode,
      isValidCode: false
    }
    console.log(`Player <${playerID}> attempted to join using code ${response.submittedRoomCode}`)

    //! for now return accept
    // const room = await RoomCollection.findOneAsync(roomId);
    // if (!room) {
    //   throw new Meteor.Error("Room not found");
    // }
    // return room

    if (!isValidRoomCode(roomCode)) { return response } else { response.isValidCode = true; }

    return response;
  }
})