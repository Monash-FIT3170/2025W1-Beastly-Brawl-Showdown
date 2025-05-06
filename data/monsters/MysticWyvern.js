const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class MysticWyvern extends Monsters {
    constructor(rerollCharge) {
        super(25, 14, 2, "Reroll once per battle","Balanced");
        rerollCharge = true;
    }
    
    attack(defender) {
        let roll = DiceRoller.d20();
        console.log(`${this._type} rolls ${roll}.`);

        // Ask the user if they want to reroll
        if (rerollCharge) {
            var reroll = confirm("Do you want to reroll the d20?");
        }
        
        if (reroll) {
            rerollCharge = false;
            roll = DiceRoller.d20();
            console.log(`${this._type} rerolls and gets ${roll}.`);
        }

        const totalAttack = roll + this._attackBonus;
        console.log(`${this._type} rolls ${roll}... Attack = ${totalAttack}.`);

        defender.defend(totalAttack);
    }

    // Elemental breath: Deals 15 + d10 damage.
    ability(defender) { 
        console.log(`${this.type} uses elemental breath...`)
        const roll = DiceRoller.d10();
        const totalAttack = 15 + roll;
        console.log(`${this.type} rolls ${roll}... Attack = ${totalAttack}.`);   
        defender.defend(totalAttack);
    }
}

module.exports = MysticWyvern;