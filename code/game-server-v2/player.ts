import { MonsterTemplate } from "../simulator/core/monster/monster";
import { RoomId } from "./types";

export class Player {
  roomId: RoomId;
  socketId: string;
  displayName: string;
  linkedAccountId?: string;
  spectators: string[];
  monster?: MonsterTemplate;
  isReady: boolean = false;

  constructor(roomId: RoomId, socketId: string, displayName: string, linkedAccountId: string | undefined) {
    this.roomId = roomId;
    this.socketId = socketId;
    this.displayName = displayName;
    this.linkedAccountId = linkedAccountId;
    this.spectators = [];
  }

  getSpectators(): string[] {
    return this.spectators;
  }

  addSpectator(id: string) {
    this.spectators.push(id);
  }

  hasMonster(): boolean {
    return this.monster !== undefined;
  }

  getMonster(): MonsterTemplate | undefined {
    return this.monster;
  }

  setMonster(monster: MonsterTemplate) {
    this.monster = monster;
  }
}
