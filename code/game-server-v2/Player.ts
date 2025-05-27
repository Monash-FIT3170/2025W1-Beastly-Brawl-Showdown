import { AccountId } from "./types";
import Monsters from "../beastly-brawl-showdown/imports/data/monsters/Monsters"

export class Player {
  socketId: string;
  displayName: string;
  monster?: Monsters;
  linkedAcccountId?: AccountId;

  constructor(
    socketId: string,
    displayName: string,
    monster?: Monsters | undefined,
    linkedAcccountId?: AccountId | undefined
  ) {
    this.socketId = socketId;
    this.displayName = displayName;
    this.monster = monster;
    this.linkedAcccountId = linkedAcccountId;
  }
}
