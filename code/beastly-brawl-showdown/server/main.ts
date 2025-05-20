"use strict";

import { Meteor } from 'meteor/meteor';
/* Import all methods here */
import "../imports/api/RoomMethods";
import { RoomServerManager } from './room/RoomServerManager';
import { RoomServer } from './room/RoomServer';

Meteor.startup(async () => {
  new RoomServerManager()
});
