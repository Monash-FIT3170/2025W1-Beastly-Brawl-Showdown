import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const Users = new Mongo.Collection("rooms");

Meteor.methods({
  "rooms.getAll"() {
    return Users.find().fetch();
  },
});

Meteor.startup(async () => {
  if ((await Users.find().countAsync()) === 0) {
    Users.insertAsync({ id: "abc123", hostId: "user1" });
    Users.insertAsync({ id: "qwerty", hostId: "user2" });
  }
});