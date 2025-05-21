import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const RoomCollection = new Mongo.Collection("rooms");

function generateRoomCode(){
//placeholder function for later on putting in the actual room code logic
}

Meteor.methods({
    async createRoom() {
      const roomId = await RoomCollection.insertAsync({
        roomCode: generateRoomCode(),
      });
      return RoomCollection.findOneAsync(roomId);
    },

    async joinRoom({ roomId }) {
      const room = await RoomCollection.findOneAsync(roomId);
      if (!room) {
        throw new Meteor.Error("Room not found");
      }
      return room}

})