import { Meteor } from "meteor/meteor";
import { RoomServer } from "./GameServer";

export let roomServer: RoomServer | null = null;

Meteor.startup(async () => {
  /** Get launch args */
  const serverNo = 7; // may change this to be a string of region & number
  const serverCapacity = 5;
  /** Start instance of room server */
  roomServer = new RoomServer(serverNo, serverCapacity);
  /** Notify database so that it can redirect to this */
  roomServer.registerServer(true);
});
