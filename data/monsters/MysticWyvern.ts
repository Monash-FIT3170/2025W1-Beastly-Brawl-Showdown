import Monsters from './Monsters';
import DiceRoller from '../utils/DiceRoller';

/**
 * MysticWyvern monster subclass.
 * Has the ability to reroll an attack once per battle.
 * Uses elemental breath as special ability.
 */
export default class MysticWyvern extends Monsters {
  private rerollCharge: boolean;

  constructor() {
    super(25, 14, 2, "Reroll once per battle", "Balanced");
    this.rerollCharge = true;
  }

  /**
   * Attacks a defender. Rolls d20, optionally allows reroll once per battle.
   * @param defender The monster being attacked.
   * @returns totalAttack The total attack value.
   * defender: Monsters
   * TODO:FIX IF NEEDED
   */
  attack(): number {
    let roll = DiceRoller.d20();
    console.log(`${this.type} rolls ${roll}.`);

    // Ask the user if they want to reroll, only if reroll charge is available
    if (this.rerollCharge) {
      // Note: In Node.js or non-browser environments, confirm won't work.
      // You may want to replace with a different prompt method or remove this in non-browser context.
      const reroll = confirm("Do you want to reroll the d20?");
      if (reroll) {
        this.rerollCharge = false;
        roll = DiceRoller.d20();
        console.log(`${this.type} rerolls and gets ${roll}.`);
      }
    }

    const totalAttack = roll + this.attackBonus;
    console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);

    return totalAttack;
  }

  /**
   * Uses elemental breath ability against the defender.
   * Deals 15 + d10 damage.
   * @param defender The monster being attacked.
   */
  useAbility(defender: Monsters): void {
    console.log(`${this.type} uses elemental breath...`);
    const roll = DiceRoller.d10();
    const totalAttack = 15 + roll;
    console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);
    defender.defend(totalAttack);
  }
}