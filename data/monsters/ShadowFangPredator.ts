const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class ShadowFangPredator extends Monsters {
    constructor() {
        super(20, 12, 4, "Critical hit on natural 18-20","Attacker");
        this._critRoll = 18;
        this._invulnerable = false;
    }

    activateSpecial() {}

    activateAbility_1() {}

    attack(defender) {
        var roll = DiceRoller.d20();
        var totalAttack = 0;
        
        if (roll >= this._critRoll) {
            totalAttack = 2*roll + this._attackBonus
            console.log(`${this._type} rolls ${roll}... Critical hit! Attack = ${totalAttack}.`)
        }
        else {
            totalAttack = roll + this._attackBonus;
            console.log(`${this._type} rolls ${roll}... Attack = ${totalAttack}.`)
        }
        
        defender.defend(totalAttack)
    }

    defend(totalAttack) {
        if (this._invulnerable) {
            console.log(`${this.type} evades the attack!`);
        } else {
            super.defend(totalAttack)
        }
    }

    // Shadow Leap: Evades an attack.
    ability(defender) {
        this._invulnerable = true;
        this._abilityCharge -= 1;
    }

    revertDefense() {
        if (defending) {
            this._defending = false;
            this._currentAC = this._baseAC;
        }

        if (invulnerable) {
            this._invulnerable = false;
        }
    }
}

module.exports = ShadowFangPredator;