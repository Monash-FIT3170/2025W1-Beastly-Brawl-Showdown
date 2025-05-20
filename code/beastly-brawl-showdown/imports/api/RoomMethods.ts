import { Meteor } from "meteor/meteor";
import { assignNewRoom } from "../../server/room/RoomServerNegotiator";

Meteor.methods({
	"room.requestHostRoom"() {
		console.log("Request to host room reccieved...")
		assignNewRoom();
  },
});
