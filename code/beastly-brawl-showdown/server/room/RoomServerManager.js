"use strict";

import { RoomServer } from "./RoomServer";

export class RoomServerManager {
	static isntance = null;

	constructor() {
		if (!RoomServerManager.instance) {
			RoomServerManager.instance = this;
			this.test_single_instance = new RoomServer(0, 5); // TODO move to array
		}
		return RoomServerManager.instance;
	}

	static async requestRoomToHost() {
		let response = { roomCode: null };

		const assignedCode = await RoomServerManager.instance.test_single_instance.createRoom();
		response.roomCode = assignedCode;

		return response;
	}
}