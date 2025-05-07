class Defend {
    constructor(monster) {
        this._monster = monster;
    }

    execute(monster) {
        monster.activateDefense();
    }
}