import { Player } from "./player";
import { Match } from "./match";
import { COMMON_MONSTER_POOL } from "../beastly-brawl-showdown/imports/simulator/data/common/common_monster_pool";

type MonsterId = Exclude<keyof typeof COMMON_MONSTER_POOL.monsters, "blank">;

export enum TournamentType {
  Standard = "standard",
  Random = "random"
}

export class TournamentManager {
  matches: Match[] = [];
  playerChannel: any;
  tournamentType: TournamentType

  constructor(playerChannel: any, type: TournamentType = TournamentType.Standard) {
    this.playerChannel = playerChannel;
    this.tournamentType = type;
  }

  // Track waiting players during random re-pick
  private pendingResolves: Map<string, (monsterKey: string) => void> = new Map();


  // Called when player submits monster (via RequestSubmitMonster)
  onMonsterSelected(player: Player, monsterKey: string) {
    const resolve = this.pendingResolves.get(player.socketId);
    if (resolve) {
      resolve(monsterKey); // unblock assignRandomMonsters
      this.pendingResolves.delete(player.socketId);
    }
  }

  async assignRandomMonsters(players: Player[]): Promise<Player[]> {
    const updated: Player[] = [];

    await Promise.all(players.map(player => {
      return new Promise<void>(resolve => {
        // Generate 3 random monsters
        const pool = this.generateRandomMonsterPool(3);

        // Ask client to choose
        this.playerChannel.to(player.socketId).emit("random-monster-choice", pool);

        // Store a resolver to be triggered when RequestSubmitMonster comes in
        this.pendingResolves.set(player.socketId, (monsterKey: string) => {
          player.setMonsterTemplate(monsterKey);
          player.isReady = true;
          updated.push(player);
          resolve();
        });
      });
    }));

    return updated;
  }

  generateRandomMonsterPool(count: number): string[] {
    const allMonsters = Object.keys(COMMON_MONSTER_POOL.monsters)
      .filter((id) => id !== "blank") as MonsterId[];

    const result: MonsterId[] = [];
    for (let i = 0; i < count; i++) {
      const pick = allMonsters[Math.floor(Math.random() * allMonsters.length)];
      result.push(pick);
    }
    return result;
  }

  async runRounds(remainingPlayers: Player[]) {
    // After the Host presses start and begins the tournament through RequestSubmitMonster in "main", 
    // "startTournament(players: Player[])" (in this file) will initiate and the match will begin 
    // as startTournament runs its first match using creatematchs (this file) and checks the results 
    // using checkRoundCompletion (this file) before checkRoundCompletion pingpongs this 
    // function over and over again to simulate a tournament.

    this.creatematchs(remainingPlayers);
    this.matches.forEach(match => match.createBattle());

    // run all battles in parallel
    await Promise.all(this.matches.map(match => match.runBattle(this.playerChannel)));

    this.checkRoundCompletion();
  }

  creatematchs(playerList: Player[]) {
    this.matches = [];
    for (let i = 0; i < playerList.length; i += 2) {
      const matchID = i / 2 + 1;
      const player2 = playerList[i + 1] ?? undefined; // keep optional
      this.matches.push(new Match(playerList[i], player2, matchID));
    }
    console.log(`Created ${this.matches.length} matchs for this round.`);
  }

  checkRoundCompletion() {
    const allCompleted = this.matches.every(match => match.winner);
    if (!allCompleted) return;

    const winners = this.matches.map(m => m.winner!).filter(Boolean);
    if (winners.length === 1) {
      console.log(`Tournament Winner: ${winners[0].displayName}`);
      // Optionally notify host:
      this.playerChannel.emit("tournament-finished", winners[0].displayName);
      return;
    }

    // Recursively run next round with winners
    this.runRounds(winners);
  }

  async startTournament(players: Player[]): Promise<void> {
    this.creatematchs(players);

    // Create battles for each match
    this.matches.forEach(match => match.createBattle());

    // Now run battles
    await Promise.all(this.matches.map(match => match.runBattle(this.playerChannel)));

    // Check and start next round if needed
    this.checkRoundCompletion();
  }
}