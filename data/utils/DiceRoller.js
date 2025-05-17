class DiceRoller {
    static roll(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    static d20() {
        return DiceRoller.roll(20);
    }

    static d12() {
        return DiceRoller.roll(12);
    }

    static d10() {
        return DiceRoller.roll(10);
    }

    static d8() {
        return DiceRoller.roll(8);
    }

    static d6() {
        return DiceRoller.roll(6);
    }

    static d4() {
        return DiceRoller.roll(4);
    }

}

module.exports = DiceRoller;
