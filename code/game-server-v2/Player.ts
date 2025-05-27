import { AccountId } from "./types";

export class Player {
  socketId: string;
  displayName: string;
  linkedAcccountId?: AccountId;

  constructor(
    socketId: string,
    displayName: string,
    linkedAcccountId?: AccountId | undefined
  ) {
    this.socketId = socketId;
    this.displayName = displayName;
    this.linkedAcccountId = linkedAcccountId;
  }
}
