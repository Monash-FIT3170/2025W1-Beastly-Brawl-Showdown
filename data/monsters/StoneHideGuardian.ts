import Monsters from './Monsters';
import DiceRoller from '../utils/DiceRoller';

export default class StoneHideGuardian extends Monsters {
    constructor() {
        super(30, 16, 1, "4 defense actions per battle", "Defender");
        this.baseDefenseCharges = 4;
        this.currentDefenseCharges = 4;
    }

    useAbility(defender: { stun: () => void }): void {
        this.currentAbilityCharges -= 1;
        defender.stun();
    }
}

