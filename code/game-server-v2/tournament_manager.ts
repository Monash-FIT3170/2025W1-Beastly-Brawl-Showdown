import { Player } from "./player";
import { Match } from "./match";

export class TournamentManager {
  // TODO: Look at whether this is needed or not
  playersByAccountId: Map<string, Player> = new Map();

  matches: Match[];

  constructor() {
    this.matches = [];
  }

  runRounds(remainingPlayers: Player[]){
  // After the Host presses start and begins the tournament through RequestSubmitMonster in "main", 
  // "startTournament(players: Player[])" (in this file) will initiate and the match will begin 
  // as startTournament runs its first match using creatematchs (this file) and checks the results 
  // using checkRoundCompletion (this file) before checkRoundCompletion pingpongs this 
  // function over and over again to simulate a tournament.

  this.creatematchs(remainingPlayers)
  this.checkRoundCompletion()}


  creatematchs(playerList: Player[]) {
    this.matches = [];

    for (let i = 0; i < playerList.length; i += 2) {
      let matchID = i / 2 + 1;
      if (i + 1 < playerList.length) {
        this.matches.push(new Match(playerList[i], matchID, playerList[i + 1]));
      } else {
        this.matches.push(new Match(playerList[i], matchID));
      }
    }

    console.log(`Created ${this.matches.length} matchs for this round.`);
  }

  async checkRoundCompletion(): Promise<void> {
    // Check if all matchs in the current round have winners
    const allCompleted = this.matches.every(match => match.winner);
    if (!allCompleted) {
      return;
    }

    // If all matchs are completed, determine winners and create new matchs for the next round
    const winners: Player[] = [];
    for (const match of this.matches) {
      if (match.winner) {
        winners.push(match.winner)
      }
    }

    this.matches = [];

    // If there's only one winner, the tournament is over
    if (winners.length === 1) {
      console.log(`Tournament Over. Winner: ${winners[0].displayName}`);
      return;
    }

    // If there are multiple winners, create new matchs for the next round
    else{
      // If there are still players remaining, then keep running the rounds.
      this.runRounds(winners)
    }
  }

  async startTournament(players: Player[]): Promise<void> {
    this.creatematchs(players);

    await Promise.all(this.matches.map(match => match.runBattle(this.playersByAccountId)))
    await this.checkRoundCompletion()
    
  }
}
