import { AccountId } from "./types";


export class Player {
  displayName: string;
  linkedAcccountId?: AccountId;

  constructor(displayName: string, linkedAcccountId: AccountId | undefined) {
    this.displayName = displayName;
    this.linkedAcccountId = linkedAcccountId;
  }
}
