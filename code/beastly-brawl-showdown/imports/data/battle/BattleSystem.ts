import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

import MysticWyvern from '../monsters/MysticWyvern';
import ShadowFangPredator from '../monsters/ShadowFangPredator';
import StoneHideGuardian from '../monsters/StoneHideGuardian';
import Monsters from '../monsters/Monsters';

const rl = readline.createInterface({ input, output });

async function chooseMonster(name: string): Promise<Monsters> {
    console.log(`Choose ${name}:`);
    console.log("1. Mystic Wyvern");
    console.log("2. Shadow Fang Predator");
    console.log("3. Stone Hide Guardian");
    const choice = parseInt(await rl.question("Enter number: "));
    switch (choice) {
        case 1: return new MysticWyvern();
        case 2: return new ShadowFangPredator();
        case 3: return new StoneHideGuardian();
        default: console.log("Invalid choice, defaulting to Mystic Wyvern."); return new MysticWyvern();
    }
}

async function chooseAction(monster: Monsters, opponent: Monsters): Promise<any> {
    const possibleActions = monster.generateActions(opponent);
    
    console.log(`\n${monster.type}'s turn. HP: ${monster.health}, AC: ${monster.AC}`);
    console.log("Choose action:");
    
    possibleActions.forEach((action, index) => {
        console.log(`${index + 1}. ${action.label}`);
    });

    const choiceIndex = parseInt(await rl.question("Enter action number: ")) - 1;
    return possibleActions[choiceIndex] ?? possibleActions[0];
}

async function battle(mon1: Monsters, mon2: Monsters): Promise<void> {
    while (mon1.health > 0 && mon2.health > 0) {
        const action1 = await chooseAction(mon1, mon2);
        const action2 = await chooseAction(mon2, mon1);

        // Execute both actions (damage and effects applied internally)
        await Promise.all([
            action1.execute(),
            action2.execute()
        ]);

        // Revert statuses
        mon1.revert();
        mon2.revert();

        // Print status
        console.log(`\n--- Round Over ---`);
        console.log(`${mon1.type} HP: ${mon1.health}`);
        console.log(`${mon2.type} HP: ${mon2.health}`);
    }

    console.log("\n=== Battle Result ===");
    if (mon1.health <= 0 && mon2.health <= 0) {
        console.log("It's a draw!");
    } else if (mon1.health <= 0) {
        console.log(`${mon2.type} wins!`);
    } else {
        console.log(`${mon1.type} wins!`);
    }

    rl.close();
}

void chooseMonster;
void battle;
