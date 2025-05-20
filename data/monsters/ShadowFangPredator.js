const Monsters = require('./Monsters');

class ShadowFangPredator extends Monsters {
    constructor() {
        super(20, 12, 4, "None","Attacker");
    }

    activateSpecial() {

    }

    // Method for abilities
    activateAbility() {

    }
}

module.exports = ShadowFangPredator;