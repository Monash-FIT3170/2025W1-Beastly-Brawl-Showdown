import readline from 'readline-sync';
import MysticWyvern from '../monsters/MysticWyvern';
import ShadowFangPredator from '../monsters/ShadowFangPredator';
import StoneHideGuardian from '../monsters/StoneHideGuardian';
import Monsters from '../monsters/Monsters';

/**
 * Use ts-node BattleSystem.ts to use the BattleSystem in terminal
 */

/**
 * Prompts the player to choose a monster by showing options.
 * Returns an instance of the selected monster class.
 * @param name - Player's name to display
 */
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
        default:
            console.log("Invalid choice, defaulting to Mystic Wyvern.");
            return new MysticWyvern();
    }
}

/**
 * Prompts the current monster to choose an action.
 * Shows available options depending on monster abilities and current state.
 * @param monster - The monster whose turn it is
 * @returns The chosen action as a string: 'attack', 'ability', or 'defend'
 */
function chooseAction(monster: Monsters): string {
    console.log(`\n${monster.type}'s turn. HP: ${monster.health}, AC: ${monster.AC}`);
    console.log("Choose action:");
    console.log("1. Attack");

    // Show special ability option if monster has ability charges left
    if (monster instanceof StoneHideGuardian || monster instanceof MysticWyvern || monster instanceof ShadowFangPredator) {
        if (monster["abilityCharges"] > 0) {
            console.log("2. Special Ability");
        }
    }

    // Show defend option if monster is not currently defending and has defense charges
    if (monster["defending"] !== undefined && monster["defending"] === false && monster["defenseCharges"] > 0) {
        console.log("3. Defend");
    }

    // Read player's choice and convert to corresponding action string
    const action = readline.questionInt("Enter action number: ");
    return ["attack", "ability", "defend"][action - 1];
}

/**
 * Main battle loop where two monsters fight until one runs out of health.
 * Both monsters take turns selecting actions simultaneously.
 * @param mon1 - First monster (Player 1)
 * @param mon2 - Second monster (Player 2)
 */
async function battle(mon1: Monsters, mon2: Monsters): Promise<void> {
    // Initialize attacker and defender for turn swapping
    let attacker = mon1;
    let defender = mon2;

    // Loop until one monster's health drops to 0 or below
    while (mon1.health > 0 && mon2.health > 0) {
        // Prompt attacker for an action choice
        const action = chooseAction(attacker);

        // Perform the chosen action
        switch (action) {
            case 'attack':
                // Await attack result since attack might be async
                const damage = await attacker.attack();

                // Defender processes the incoming damage
                defender.defend(damage);
                break;

            case 'defend':
                // Activate defense mode, which might boost AC or other effects
                attacker.activateDefense();
                break;

            case 'ability':
                // Use special ability against defender if available
                attacker.useAbility(defender);
                break;

            default:
                console.log("Invalid action.");
        }

        // Reset any temporary statuses like defending or invulnerability
        attacker.revert();

        // Swap attacker and defender for next turn
        [attacker, defender] = [defender, attacker];

        console.log("\n--- Next Turn ---\n");
    }

    // After the loop ends, one monster has won
    const winner = mon1.health > 0 ? mon1 : mon2;
    console.log(`${winner.type} wins!`);
}

// Entry point: prompt both players to select their monsters
const monster1 = chooseMonster("Player 1");
const monster2 = chooseMonster("Player 2");

// Start the battle asynchronously
battle(monster1, monster2);
