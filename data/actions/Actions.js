const DiceRoller = require('../utils/DiceRoller');

class Action {
    static attack(attacker, defender) {
        return Attack.perform(attacker, defender);
    }

    static defend(monster) {
        Defend.perform(monster);
    }

    static endDefend(monster) {
        Defend.revert(monster);
    }
}

class Attack {
    static perform(attacker, defender) {
        const totalAttack = attacker.attack();
        defender.defend(totalAttack);
    }
}

class Defend {
    static perform(monster) {
        monster.activateDefense();
    }

    static revert(monster) {
        monster.revertDefense();
    }
}

module.exports = Action;