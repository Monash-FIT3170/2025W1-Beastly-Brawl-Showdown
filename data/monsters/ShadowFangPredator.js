const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class ShadowFangPredator extends Monsters {
    constructor() {
        super(20, 12, 4, "Critical hit on natural 18-20","Attacker");
        this._critRoll = 18;
        this._isInvulnerable = false;
    }

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
        if (this._isInvulnerable) {
            console.log(`${this._type} evades the attack!`)
            return;
        } else {
            super.defend(totalAttack)
        }
    }

    revert() {
        this._defending = false;
        this._currentAC = this._baseAC;
        this._isInvulnerable = false;
    }

    useAbility() {
        this._currentAbilityCharges -= 1;
        this._isInvulnerable = true;
    }
}

module.exports = ShadowFangPredator;