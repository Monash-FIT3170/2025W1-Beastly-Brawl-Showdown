import Sqids from "sqids";
import { log_notice, log_warning } from "./utils";
import { Room } from "./room";
import { Player } from "./player";
import { ServerId, RoomId, JoinCode, AccountId } from "./types";
import { TournamentType } from "./tournament_manager";

export class GameServer {
  readonly CODE_MIN_LENGTH = 6; // TODO move to argv
  readonly CODE_ALPHABET = "0123456789"; // TODO move to argv

  /** The assigned server number */
  readonly serverId: ServerId;
  /** Max number of slots */
  readonly maxCapacity: number;

  /** Initialize new sqids object */
  readonly sqids = new Sqids({
    minLength: this.CODE_MIN_LENGTH,
    alphabet: this.CODE_ALPHABET,
  });

  /**  The last room id that was given out */
  private lastAssignedRoomId: RoomId = 0;

  hostIdToRoomIdLookup = new Map<string, RoomId>();
  /**  The array to store rooms */
  rooms = new Map<RoomId, Room>();
  playerChannel: any;

  constructor(serverId: ServerId, maxCapacity: number) {
    if (serverId < 0) {
      throw new Error("Invalid server id.");
    }
    this.serverId = serverId;

    if (maxCapacity <= 0) {
      throw new Error("Invalid server capacity.");
    }
    this.maxCapacity = maxCapacity;
  }

  private peekNextRoomId(): RoomId {
    return this.lastAssignedRoomId + 1;
  }
  private popNextRoomId(): RoomId {
    this.lastAssignedRoomId = this.peekNextRoomId();
    return this.lastAssignedRoomId;
  }

  countActiveRooms(): number {
    return this.rooms.size;
  }

  isFull(): boolean {
    if (this.countActiveRooms() > this.maxCapacity) {
      log_warning("Server over capacity.");
    }
    return this.countActiveRooms() >= this.maxCapacity;
  }

  createRoom(
    hostSocketId: string,
    playerChannel: any,
    tournamentType: TournamentType = TournamentType.Standard
  ): { roomId: RoomId; joinCode: JoinCode } {
    if (this.isFull()) {
      throw new Error("Server is full.");
    }

    const newRoom: Room = new Room(
      hostSocketId,
      this.peekNextRoomId(),
      this.sqids.encode([this.serverId, this.peekNextRoomId()]),
      playerChannel,
      tournamentType // <-- pass tournament type here
    );

    if (this.hasRoom(newRoom.roomId)) {
      throw new Error("Existing room has the same ID.");
    }

    this.rooms.set(newRoom.roomId, newRoom);
    this.hostIdToRoomIdLookup.set(hostSocketId, newRoom.roomId);
    this.popNextRoomId(); /// Increment once the room is saved

    return { roomId: newRoom.roomId, joinCode: newRoom.joinCode };
  }

  translateJoinCodeToRoomId(joinCode: JoinCode) {
    return this.sqids.decode(joinCode)[1]; /// We already know the server id (of this)
  }

  hasRoom(roomId: RoomId): boolean {
    return this.rooms.has(roomId);
  }

  joinRoom(
    socketId: string,
    roomId: RoomId,
    displayName: string,
    linkedAcccountId: AccountId | undefined,
  ) {
    //TODO validate input

    const room: Room = this.rooms.get(roomId)!;
    if (!room) {
      throw new Error("Invalid room id.");
    }

    if (room.hasPlayer(displayName)) {
      throw new Error("Display name already taken.");
    }

    const newPlayer = new Player(roomId, socketId, displayName, linkedAcccountId);
    room.players.push(newPlayer);
  }
}
