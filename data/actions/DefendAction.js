class DefendAction {
    constructor(monster) {
        this.monster = monster;
    }

    execute() {
        this.monster.activateDefense();
    }
}

module.exports = DefendAction;