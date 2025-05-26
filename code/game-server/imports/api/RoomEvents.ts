import { Meteor } from "meteor/meteor";

Meteor.methods({
  getServerStatus() {
    return { status: 'Updated!', timestamp: new Date() };
  }
});