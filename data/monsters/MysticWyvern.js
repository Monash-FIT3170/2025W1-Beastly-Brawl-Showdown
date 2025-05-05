const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class MysticWyvern extends Monsters {
    constructor() {
        super(25, 14, 2, "Reroll once per battle","Balanced");
        rerollCharge = true;
    }

    activateSpecial() {
        this.rerollCharge = true;
    }

    attack(defender) {
        let roll = DiceRoller.d20();
        console.log(`${this._type} rolls ${roll}.`);

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

module.exports = MysticWyvern;