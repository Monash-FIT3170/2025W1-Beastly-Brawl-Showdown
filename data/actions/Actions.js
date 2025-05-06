const DiceRoller = require('../utils/DiceRoller');

class Attack {
    constructor(attacker, defender) {
        this._attacker = attacker;
        this._defender = defender;
    }

    static perform(attacker, defender) {
        const totalAttack = attacker.attack();
        defender.defend(totalAttack);
    }
}

class Defend {
    constructor(monster) {
        this._monster = monster;
    }

    static perform(monster) {
        monster.activateDefense();
    }

    static revert(monster) {
        monster.revertDefense();
    }
}

class Ability {
    constructor(attacker, defender) {
        this._attacker = attacker;
        this._defender = defender;
    }

    static perform(attacker, defender) {
        if (attacker._abilityCharges > 0) {
            attacker.ability(defend);
        } else {
            console.log('No remaining ability charges.');
        }
    }   
}


module.exports = Action;