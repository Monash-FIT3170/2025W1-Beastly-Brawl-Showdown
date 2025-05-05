const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class ShadowFangPredator extends Monsters {
    constructor() {
        super(20, 12, 4, "Critical hit on natural 18-20","Attacker");
        this.critRoll = 18;
    }

    activateSpecial() {}

    activateAbility() {}

    attack(defender) {
        var roll = DiceRoller.d20();
        var totalAttack = 0;
        
        if (roll >= this.critRoll()) {
            totalAttack = 2*roll + this._attackBonus
            console.log(`${this._type} rolls ${roll}... Critical hit! Attack = ${totalAttack}.`)
        }
        else {
            totalAttack = roll + this._attackBonus;
            console.log(`${this._type} rolls ${roll}... Attack = ${totalAttack}.`)
        }
        
        defender.defend(totalAttack)
    }
}

module.exports = ShadowFangPredator;