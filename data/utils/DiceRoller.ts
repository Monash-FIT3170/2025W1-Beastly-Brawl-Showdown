export default class DiceRoller {
    static roll(sides: number): number {
        return Math.floor(Math.random() * sides) + 1;
    }

    static d20(): number {
        return DiceRoller.roll(20);
    }

    static d12(): number {
        return DiceRoller.roll(12);
    }

    static d10(): number {
        return DiceRoller.roll(10);
    }

    static d8(): number {
        return DiceRoller.roll(8);
    }

    static d6(): number {
        return DiceRoller.roll(6);
    }

    static d4(): number {
        return DiceRoller.roll(4);
    }
}
