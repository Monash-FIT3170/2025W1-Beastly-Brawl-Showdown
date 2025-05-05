const Monsters = require('./Monsters');
const DiceRoller = require('../utils/DiceRoller');


class StoneHideGuardian extends Monsters {
    constructor() {
        super(30, 16, 1, "4 defense actions per battle","Defender");
        this.defenseCharges = 4;
    }
}

module.exports = StoneHideGuardian;