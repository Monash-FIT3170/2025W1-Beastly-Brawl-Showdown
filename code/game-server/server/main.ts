import { Meteor } from "meteor/meteor";
import { GamerServer } from "./GameServer";

/// Import all methods
import "../imports/api/RoomMethods";

export let gameServer: GamerServer;

Meteor.startup(async () => {
  /** Get launch args */
  const serverNo = 7; // may change this to be a string of region & number
  const serverCapacity = 999;
  /** Start instance of room server */
  gameServer = await GamerServer.start(serverNo, serverCapacity);
});
