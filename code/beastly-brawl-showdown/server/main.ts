import "../imports/api/RoomMethods";
import { Meteor } from "meteor/meteor";
import Sqids from "sqids";
/* Import all methods here */
// import "../../room-server/imports/api/RoomMethods";
// import { RoomServerManager } from './room/RoomServerManager';
// import { RoomServer } from '../../room-server/server/RoomServer';

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
