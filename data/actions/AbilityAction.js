class Ability {
    constructor(attacker, defender) {
        this._attacker = attacker;
        this._defender = defender;
    }

    static perform(attacker, defender) {
        attacker.useAbility(defend);
    }   
}