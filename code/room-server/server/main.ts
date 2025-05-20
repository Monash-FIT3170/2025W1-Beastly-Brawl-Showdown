import { Meteor } from "meteor/meteor";
import { RoomServer, RoomServerCollection } from "./RoomServer";

Meteor.startup(async () => {
  /** Get launch args */
  const serverNo = 7; // may change this to be a string of region & number
  const serverCapacity = 5;
  /** Start instance of room server */
  const rs = new RoomServer(serverNo, serverCapacity);
  /** Notify database so that it can redirect to this */
  // TODO

  /// ADD TESTING DATA IF EMPTY
  if ((await RoomServerCollection.find().countAsync()) === 0) {
    RoomServerCollection.insertAsync({ serverNo: "0", serverURL: "http://localhost:3100" });
    RoomServerCollection.insertAsync({ serverNo: "7", serverURL: "http://localhost:3107" });
  }
});
