import { Meteor } from 'meteor/meteor';
import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { RoomServer } from './room/RoomServer';



Meteor.startup(async () => {
  new RoomServerManager()

});
