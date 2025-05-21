import Monsters from './Monsters';
import DiceRoller from '../utils/DiceRoller';

export default class StoneHideGuardian extends Monsters {
    defenseCharges: number;

    constructor() {
        super(30, 16, 1, "4 defense actions per battle", "Defender");
        this.defenseCharges = 4;
    }

    useAbility(defender: { stun: () => void }): void {
        this.currentAbilityCharges -= 1;
        defender.stun();
    }
}
