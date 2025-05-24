import Monsters from "/imports/data/monsters/Monsters";

export class Player {
  private displayName: string;
  private monsters: Monsters[];  // store monsters here

  constructor(displayName: string) {
    this.displayName = displayName;
    this.monsters = []; // initialize empty list of monsters
  }

  /** Method to get the name of this player */
  getName(): string {
    return this.displayName;
  }

  /** Method to display player name when player object is printed */
  toString(): string {
    return this.displayName;
  }

  /** Get all monsters */
  getMonsters(): Monsters[] {
    return this.monsters;
  }

  /** Add a monster */
  addMonster(monster: Monsters): void {
    this.monsters.push(monster);
  }

  /** Remove a monster by reference or ID, if needed */
  removeMonster(monster: Monsters): boolean {
    const index = this.monsters.indexOf(monster);
    if (index >= 0) {
      this.monsters.splice(index, 1);
      return true;
    }
    return false;
  }
}
