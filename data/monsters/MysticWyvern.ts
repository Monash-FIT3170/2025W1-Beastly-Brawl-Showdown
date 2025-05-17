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

        // Ask the user if they want to reroll
        if (rerollCharge) {
            var reroll = confirm("Do you want to reroll the d20?");
        }
        
        if (reroll) {
            roll = DiceRoller.d20();
            console.log(`${this._type} rerolls and gets ${roll}.`);
        }

        const totalAttack = roll + this._attackBonus;
        console.log(`${this._type} rolls ${roll}... Attack = ${totalAttack}.`);

        defender.defend(totalAttack);
    }
}
