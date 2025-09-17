import { Player } from "./player";
import { Match, MatchType } from "./match";
import { COMMON_MONSTER_POOL } from "../beastly-brawl-showdown/imports/simulator/data/common/common_monster_pool";

type MonsterId = Exclude<keyof typeof COMMON_MONSTER_POOL.monsters, "blank">;

export enum TournamentType {
  Standard = "standard",
  Random = "random"
}

export class TournamentManager {
  matches: Match[] = [];
  playerChannel: any;
  tournamentType: TournamentType;

  // Track waiting players during random re-pick
  private pendingResolves: Map<string, (monsterKey: string) => void> = new Map();

  constructor(playerChannel: any, type: TournamentType) {
    this.playerChannel = playerChannel;
    this.tournamentType = type;
  }

  /**
   * Called when a player submits a monster
   */
  onMonsterSelected(player: Player, monsterKey: string) {
    const resolve = this.pendingResolves.get(player.socketId);
    if (resolve) {
      resolve(monsterKey); // unblock assignRandomMonsters
      this.pendingResolves.delete(player.socketId);
    }
  }

  /**
   * Waits for all players in the list to submit their monster
   */
  private async waitForAllPlayersToPick(players: Player[]) {
    await Promise.all(players.map(player => {
      return new Promise<void>(resolve => {
        // Listen for the player's submitted monster
        this.pendingResolves.set(player.socketId, (monsterKey: string) => {
          player.setMonsterTemplate(monsterKey);
          player.isReady = true;
          this.pendingResolves.delete(player.socketId);
          resolve();
        });

        // Send the current pool to client
        this.playerChannel.to(player.socketId).emit("requestMonsterSelection", {
          monsterPool: player.currentMonsterPool,
        });
      });
    }));
  }

  /**
   * Starts the tournament with a list of players
   */
  async startTournament(players: Player[]): Promise<void> {
    if (!players.length) return;

    console.log("[Notice] Starting tournament with players:", players.map(p => p.displayName));

    // If random tournament, assign initial pools
    if (this.tournamentType === TournamentType.Random) {
      players.forEach(player => {
        player.currentMonsterPool = this.getRandomPool(3);
      });

      // Wait for initial selection
      await this.waitForAllPlayersToPick(players);
    }

    // Run first round
    await this.runRounds(players);
  }

  /**
   * Runs rounds recursively until a winner is determined
   */
  private async runRounds(players: Player[]): Promise<void> {
    if (!players.length) {
      console.log("[Notice] No players to run next round.");
      return;
    }

    console.log("[Notice] Starting new round with players:", players.map(p => p.displayName));

    // Reset ready states for random tournaments
    if (this.tournamentType === TournamentType.Random) {
      players.forEach(p => p.isReady = false);
    }

    // Create matches for this round
    this.createMatches(players);
    console.log(`[Notice] Created ${this.matches.length} matches for this round.`);

    // Run all battles
    for (const match of this.matches) {
      if (match.matchType === MatchType.BYE) {
        // BYE match: auto-advance
        match.winner = match.player1;
        console.log(`[Notice] Match ${match.matchID} is a BYE. Player ${match.player1.displayName} advances.`);
        continue;
      }

      // DUEL match: create battle and run
      match.createBattle();
      await match.runBattle(this.playerChannel);
    }

    // Collect winners
    const winners = this.matches
      .map(m => m.winner)
      .filter(Boolean) as Player[];

    console.log("[Notice] Round completed. Winners:", winners.map(p => p.displayName));

    // If only one winner, tournament is over
    if (winners.length === 1) {
      console.log(`[Notice] Tournament Winner: ${winners[0].displayName}`);
      this.playerChannel.emit("tournament-finished", winners[0].displayName);
      return;
    }

    // For random tournaments, assign new pools for winners
    if (this.tournamentType === TournamentType.Random) {
      winners.forEach(player => {
        player.currentMonsterPool = this.getRandomPool(3);
        player.isReady = false;
      });

      // Wait for winners to pick new monsters
      await this.waitForAllPlayersToPick(winners);
    }

    // Recursively run next round with winners
    await this.runRounds(winners);
  }

  /**
   * Creates matches for a list of players
   */
  private createMatches(players: Player[]): void {
    this.matches = [];
    for (let i = 0; i < players.length; i += 2) {
      const matchID = i / 2 + 1;
      const player2 = players[i + 1] ?? undefined; // optional second player
      this.matches.push(new Match(players[i], player2, matchID));
    }
  }

  /**
   * Utility: generates a random monster pool of size n
   */
  private getRandomPool(n: number): string[] {
    const allKeys = Object.keys(COMMON_MONSTER_POOL.monsters).filter(k => k !== "blank");
    const shuffled = allKeys.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }
}
