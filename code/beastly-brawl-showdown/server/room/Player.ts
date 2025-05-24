export class Player {
  private displayName: string;

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  /** Method to get the name of this player */
  getName(): string {
    return this.displayName;
  }

  /** Method to display player name when player object is printed */
  toString(): string {
    return this.displayName;
  }
}