import { MonsterTemplate } from "../simulator/core/monster/monster_template";
import { RoomId } from "./types";

export class Player {
  roomId: RoomId;
  socketId: string;
  displayName: string;
  spectators: Player[];
  monster?: MonsterTemplate;
  selectedMonsterTemplateName?: string;
  isReady: boolean = false;
  submittedMove: boolean = false;
  currentMonsterPool?: string[];

  constructor(roomId: RoomId, socketId: string, displayName: string) {
    this.roomId = roomId;
    this.socketId = socketId;
    this.displayName = displayName;
    this.spectators = [];
  }

  getSpectators(): Player[] {
    return this.spectators;
  }

  addSpectator(player: Player) {
    this.spectators.push(player);
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

  setMonsterTemplate(templateName: string) {
    this.selectedMonsterTemplateName = templateName;
  }
}
