import { Meteor } from 'meteor/meteor';
import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { GameStates } from '/imports/api/GameStates';
import { check } from "meteor/check";
import "../imports/api/GameStateMethods";


Meteor.publish("gameStatesByRoom", function (roomId: string) {
  check(roomId, String);
  return GameStates.find({ roomId });
});

Meteor.startup(async () => {
  new RoomServerManager()

});