class AttackAction {
    constructor(attacker, defender) {
        this.attacker = attacker;
        this.defender = defender;
    }

    execute() {
        const totalAttack = this.attacker.attack();
        this.defender.defend(totalAttack);
    }
}


module.exports = AttackAction;