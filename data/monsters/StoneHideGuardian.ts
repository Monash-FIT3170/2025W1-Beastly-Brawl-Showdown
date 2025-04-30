const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class StoneHideGuardian extends Monsters {
    constructor() {
        super(30, 16, 1, "None","Defender");
        this.defenseCharges = 4;
    }

    activateSpecial() {}

    activateAbility() {}
}

module.exports = StoneHideGuardian;