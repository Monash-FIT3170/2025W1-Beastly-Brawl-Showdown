import { RoomServer } from "./RoomServer";

export class RoomServerManager {
	static instance = null;
	foo = null;

	constructor() {
		if (!RoomServerManager.instance) {
			RoomServerManager.instance = this;
			this.foo = new RoomServer(0, 5); // TODO move to array
		}
		return RoomServerManager.get();
	}

	static get() {
		return RoomServerManager.instance;
	}

	static async requestNewRoomAllocation() {
		let response = { roomCode: null };

		const assignedCode = await RoomServerManager.get().foo.createRoom();
		response.roomCode = assignedCode;

		return response;
	}

	static async requestPlayerJoinRoom({ roomCode }) {
		let response = { isValidCode: false };

		if (await RoomServerManager.get().foo.hasInstanceWithCode(roomCode)) { response.isValidCode = true; } // this should check against all instances but this is fine for now

		return response;
	}
}