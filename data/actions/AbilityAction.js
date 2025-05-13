class AbilityAction {
    constructor(attacker, defender) {
        this.attacker = attacker;
        this.defender = defender;
    }

    static perform(attacker, defender) {
        this.attacker.useAbility(defend);
    }   
}


module.exports = AbilityAction;