import DiceRoller from "../utils/DiceRoller";
import AttackAction from "../actions/AttackAction";
import DefendAction from "../actions/DefendAction";
import AbilityAction from "../actions/AbilityAction";

/**
 * Base class for the different monsters in the game.
 * Includes all universal attributes with some default values.
 * Includes default methods such as attack and defend for monster subclasses which share functionality.
 */
export default class Monsters {
  protected baseHealth: number;
  protected currentHealth: number;
  protected baseAC: number;
  protected currentAC: number;
  protected atkBonus: number;
  protected special: string;
  protected baseAbilityCharges: number;
  protected currentAbilityCharges: number;
  /** MONSTER NAME */ // TODO CHAGNE THIS
  protected monsterType: string;
  protected baseDefenseCharges: number;
  protected currentDefenseCharges: number;
  protected defending: boolean;
  protected stunRemaining: number;
  protected imageSelectionURL: string;
  protected imageUrl: string;

  constructor(
    health: number,
    AC: number,
    attackBonus: number,
    special: string,
    type: string,
    imageSelectionURL: string,
    imageUrl: string
  ) {
    this.baseHealth = health;
    this.currentHealth = health;
    this.baseAC = AC;
    this.currentAC = AC;
    this.atkBonus = attackBonus;
    this.special = special;
    this.baseAbilityCharges = 1;
    this.currentAbilityCharges = 1;
    this.monsterType = type;
    this.baseDefenseCharges = 3;
    this.currentDefenseCharges = 3;
    this.defending = false;
    this.stunRemaining = 0;
    this.imageSelectionURL = imageSelectionURL;
    this.imageUrl = imageUrl;
  }

  /**
   * Activates this monster's defense, raising the AC and consuming a defense charge.
   */
  activateDefense(): void {
    this.defending = true;
    this.currentAC = this.baseAC + 2;
    this.currentDefenseCharges -= 1;
  }

  /**
   * Initiates an attack against an opponent.
   * Rolls the d20 and calculates the totalAttack delivered using the roll and this monster's attack bonus.
   *
   * @returns totalAttack: The power of this attack.
   */
  async attack(): Promise<number> {
    const roll = DiceRoller.d20();
    const totalAttack = roll + this.atkBonus;
    console.log(
      `${this.monsterType} rolls ${roll}... Attack = ${totalAttack}.`
    );
    return totalAttack;
  }

  /**
   * Computes an incoming attack from another monster.
   * Checks whether this monster's defense is activated.
   * Compares totalAttack to AC and decrements this monster's health appropriately.
   *
   * @param totalAttack The power of the incoming attack.
   */
  defend(totalAttack: number): void {
    if (this.defending === true) {
      if (totalAttack >= this.currentAC) {
        console.log(
          `${this.monsterType}'s defense fails! ${this.monsterType} takes 5 damage.`
        );
        this.currentHealth -= 5;
      } else {
        console.log(`The attack misses!`);
      }

      // Reset AC and defense flag after defense turn ends
      this.currentAC = this.baseAC;
      this.defending = false;
    } else {
      if (totalAttack >= this.currentAC) {
        console.log(`${this.type} takes ${totalAttack} damage!`);
        this.currentHealth -= 5;
      } else {
        console.log(`${this.monsterType}: The attack misses!`);
      }
    }
  }

  /**
   * Generates the possible actions a monster can take given its status, defense charges and ability charges.
   *
   * @param opponent The monster which this monster is fighting.
   * @returns An array of possible actions.
   */
  generateActions(opponent: Monsters): any[] {
    const actions: any[] = [];
    if (this.stunRemaining === 0) {
      actions.push(new AttackAction(this, opponent));
      if (this.currentDefenseCharges > 0) {
        actions.push(new DefendAction(this));
      }
      if (this.currentAbilityCharges > 0) {
        actions.push(new AbilityAction(this, opponent));
      }
    }
    return actions;
  }

  /**
   * Resets this monster's AC to base.
   * Used to wipe status effects and revert a defense action after each turn in a battle.
   */
  revert(): void {
    this.currentAC = this.baseAC;
    if (this.stunRemaining > 0) {
      this.stunRemaining -= 1;
    }
  }

  /**
   * Resets this monster to its initial state.
   * Used at the end of a battle to ready this monster for the next fight.
   */
  reset(): void {
    this.currentHealth = this.baseHealth;
    this.currentAC = this.baseAC;
    this.currentDefenseCharges = this.baseDefenseCharges;
    this.stunRemaining = 0;
    this.currentAbilityCharges = this.baseAbilityCharges;
  }

  /**
   * Applies a stun effect to the monster, lasting 2 turns.
   */
  stun(): void {
    this.stunRemaining += 2;
  }

  /**
   * Placeholder for a monster's special ability. Should be overridden by subclasses.
   *
   * @param _defender The opponent affected by the ability.
   */
  useAbility(_defender: Monsters): void {}

  // Getters and setters
  get AC(): number {
    return this.currentAC;
  }

  set AC(value: number) {
    this.currentAC = value;
  }

  get attackBonus(): number {
    return this.atkBonus;
  }

  set attackBonus(value: number) {
    this.atkBonus = value;
  }

  get health(): number {
    return this.currentHealth;
  }

  set health(value: number) {
    this.currentHealth = value;
  }

  get type(): string { //TODO CHAGNE THIS
    return this.monsterType;
  }

  get abilityCharges(): number {
    return this.currentAbilityCharges;
  }

  get defenseCharges(): number {
    return this.currentDefenseCharges;
  }

  get image(): string {
    return this.imageUrl;
  }

  get imageSelection(): string {
    return this.imageSelectionURL;
  }
}
