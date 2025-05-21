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
        const roll = DiceRoller.d20();
        const totalAttack = roll + attacker.attackBonus;
        console.log(`${attacker.type} rolls ${roll} + ${attacker.attackBonus} = ${totalAttack} vs AC ${defender.AC}`);
        
        if (totalAttack > defender.AC) {
            defender.health -= 5;
            console.log(`${attacker.type} hits ${defender.type} for 5 damage!`);
            return true;
        } else {
            console.log(`${attacker.type} misses!`);
            return false;
        }
    }
}

class Defend {
    static perform(monster) {
        monster.AC += 2;
        console.log(`${monster.type} is defending! AC increased to ${monster.AC} for this turn.`);
    }

    static revert(monster) {
        monster.AC -= 2;
        console.log(`${monster.type}'s defense fades. AC back to ${monster.AC}.`);
    }
}

module.exports = Action;