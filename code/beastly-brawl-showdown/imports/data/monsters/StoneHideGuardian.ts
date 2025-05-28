import Monsters from "./Monsters";

export default class StoneHideGuardian extends Monsters {
  constructor() {
    super(
      'StoneHideGuardian',
      30,
      16,
      1,
      "4 defense actions per battle",
      "Defender",
      "/img/monster-selection-images/placeholder_monster_3.png",
      "/img/monster-image/superminion.png"
    );
    this.baseDefenseCharges = 4;
    this.currentDefenseCharges = 4;
  }

  useAbility(defender: { stun: () => void }): void {
    this.currentAbilityCharges -= 1;
    defender.stun();
  }
}
