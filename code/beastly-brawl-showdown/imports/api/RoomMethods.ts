import { Meteor } from "meteor/meteor";
import { assignNewRoom } from "../../server/GameServerLocator";

Meteor.methods({
	"room.requestHostRoom"() {
		console.log("Request to host room reccieved...")
		assignNewRoom();
  },
});
