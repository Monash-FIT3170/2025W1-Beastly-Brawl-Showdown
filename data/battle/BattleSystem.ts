import readline from 'readline-sync';
import MysticWyvern from '../monsters/MysticWyvern';
import ShadowFangPredator from '../monsters/ShadowFangPredator';
import StoneHideGuardian from '../monsters/StoneHideGuardian';
import Monsters from '../monsters/Monsters';

function chooseMonster(name: string): Monsters {
    console.log(`Choose ${name}:`);
    console.log("1. Mystic Wyvern");
    console.log("2. Shadow Fang Predator");
    console.log("3. Stone Hide Guardian");
    const choice = readline.questionInt("Enter number: ");
    switch (choice) {
        case 1: return new MysticWyvern();
        case 2: return new ShadowFangPredator();
        case 3: return new StoneHideGuardian();
        default: console.log("Invalid choice, defaulting to Mystic Wyvern."); return new MysticWyvern();
    }
}

function chooseAction(monster: Monsters): string {
    console.log(`\n${monster.type}'s turn. HP: ${monster.health}, AC: ${monster.AC}`);
    console.log("Choose action:");
    console.log("1. Attack");
    if ((monster instanceof StoneHideGuardian || monster instanceof MysticWyvern || monster instanceof ShadowFangPredator) && monster.abilityCharges > 0) {
        console.log("2. Special Ability");
    }
    if (monster.defending === false && monster.defenseCharges > 0) {
        console.log("3. Defend");
    }
    const action = readline.questionInt("Enter action number: ");
    return ["attack", "ability", "defend"][action - 1];
}

async function battle(mon1: Monsters, mon2: Monsters): Promise<void> {
    while (mon1.health > 0 && mon2.health > 0) {
        // Both choose actions before resolving
        const action1 = chooseAction(mon1);
        const action2 = chooseAction(mon2);

        // Prepare to store attack damage results
        let attackDamage1: number | null = null;
        let attackDamage2: number | null = null;

        // Resolve actions but do NOT apply damage yet

        // For attacks, call attack() and await result
        if (action1 === "attack") {
            attackDamage1 = await mon1.attack();
        }
        if (action2 === "attack") {
            attackDamage2 = await mon2.attack();
        }

        // Abilities and defenses
        if (action1 === "ability") {
            mon1.useAbility(mon2);
        }
        if (action2 === "ability") {
            mon2.useAbility(mon1);
        }

        if (action1 === "defend") {
            mon1.activateDefense();
        }
        if (action2 === "defend") {
            mon2.activateDefense();
        }

        // Now apply damage simultaneously

        if (attackDamage1 !== null) {
            mon2.defend(attackDamage1);
        }
        if (attackDamage2 !== null) {
            mon1.defend(attackDamage2);
        }

        // Reset temporary defense or status flags after turn
        mon1.revert();
        mon2.revert();

        // Show health status after both attacks
        console.log(`\nAfter this round:`);
        console.log(`${mon1.type} HP: ${mon1.health}`);
        console.log(`${mon2.type} HP: ${mon2.health}`);

        console.log("\n--- Next Turn ---\n");
    }

    if (mon1.health <= 0 && mon2.health <= 0) {
        console.log("It's a draw!");
    } else if (mon1.health <= 0) {
        console.log(`${mon2.type} wins!`);
    } else {
        console.log(`${mon1.type} wins!`);
    }
}

// Entry point
const monster1 = chooseMonster("Player 1");
const monster2 = chooseMonster("Player 2");

battle(monster1, monster2);
