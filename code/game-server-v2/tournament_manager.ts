import { Player } from "./player";
import { Match } from "./match";

export class TournamentManager {
  matches: Match[] = [];
  playerChannel: any;

  constructor(playerChannel: any) {
    this.playerChannel = playerChannel;
  }

  async runRounds(remainingPlayers: Player[]) {
    // After the Host presses start and begins the tournament through RequestSubmitMonster in "main", 
    // "startTournament(players: Player[])" (in this file) will initiate and the match will begin 
    // as startTournament runs its first match using creatematchs (this file) and checks the results 
    // using checkRoundCompletion (this file) before checkRoundCompletion pingpongs this 
    // function over and over again to simulate a tournament.

    this.creatematchs(remainingPlayers);

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
