class Attack {
    constructor(attacker, defender) {
        this._attacker = attacker;
        this._defender = defender;
    }

    execute(attacker, defender) {
        const totalAttack = attacker.attack();
        defender.defend(totalAttack);
    }
}