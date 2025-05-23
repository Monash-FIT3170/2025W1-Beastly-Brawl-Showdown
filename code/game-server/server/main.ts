import { Meteor } from "meteor/meteor";
import { GamerServer } from "./GameServer";

export let gameServer: GamerServer;

Meteor.startup(async () => {
  /** Get launch args */
  const serverNo = 7; // may change this to be a string of region & number
  const serverCapacity = 5;
  /** Start instance of room server */
  gameServer = await GamerServer.start(serverNo, serverCapacity);
});
