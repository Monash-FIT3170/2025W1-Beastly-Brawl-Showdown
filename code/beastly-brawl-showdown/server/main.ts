import { Meteor } from 'meteor/meteor';
import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';



Meteor.startup(async () => {
  new RoomServerManager()

});
