import { RoomServer } from "./RoomServer";

export class RoomServerManager {
    static instance: RoomServerManager | null = null;
    foo: RoomServer;

    constructor() {
        this.foo = new RoomServer(0, 5);
    }

    static get(): RoomServerManager {
        if (!RoomServerManager.instance) {
            RoomServerManager.instance = new RoomServerManager();
        }
        return RoomServerManager.instance;
    }

    static async requestNewRoomAllocation(): Promise<{ roomCode: string | null }> {
        let response: { roomCode: string | null } = { roomCode: null };

        const assignedCode: string = await RoomServerManager.get().foo.createRoom();
        response.roomCode = assignedCode;

        return response;
    }

    static async requestPlayerJoinRoom({ roomCode }: { roomCode: string}): Promise<{ isValidCode: boolean }> {
        let response: { isValidCode: boolean } = { isValidCode: false };

        if (await RoomServerManager.get().foo.hasInstanceWithCode(roomCode)) { response.isValidCode = true; } /** this should check against all instances but this is fine for now */ 

        return response;
    }
}