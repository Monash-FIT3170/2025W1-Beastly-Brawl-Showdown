import { Player } from "./player";
import { Match } from "./match";
import { getRandomPool, log_attention, log_event } from "./utils";
import { PlayerNamespace } from "../shared/types";

export enum TournamentType {
  Standard = "standard",
  Random = "random",
}

export class TournamentManager {
  matches: Match[] = [];
  playerChannel: PlayerNamespace;
  tournamentType: TournamentType;
  winners: Player[] = [];
  private monsterSelectionResolvers: Map<string, (monster: string) => void> = new Map();

  constructor(playerChannel: PlayerNamespace, type: TournamentType) {
    this.playerChannel = playerChannel;
    this.tournamentType = type;
  }

  async runRounds(remainingPlayers: Player[]) {
    // After the Host presses start and begins the tournament through RequestSubmitMonster in "main", 
    // "startTournament(players: Player[])" (in this file) will initiate and the match will begin 
    // as startTournament runs its first match using creatematchs (this file) and checks the results 
    // using checkRoundCompletion (this file) before checkRoundCompletion pingpongs this 
    // function over and over again to simulate a tournament.
    log_attention("Remaining Players: ");
    console.log(remainingPlayers);
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

  public async waitForMonsterSelections(players: Player[]) {
    const promises = players.map(player => {
      return new Promise<void>(resolve => {
        this.monsterSelectionResolvers.set(player.socketId, (monsterName) => {
          player.selectedMonsterTemplateName = monsterName;
          this.monsterSelectionResolvers.delete(player.socketId);
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  public resolveMonsterSelection(player: Player, monsterName: string) {
    const resolver = this.monsterSelectionResolvers.get(player.socketId);
    if (resolver) {
      resolver(monsterName);
    }
  }

  async checkRoundCompletion() {
    const allCompleted = this.matches.every(match => match.winner);
    if (!allCompleted) return;

    this.winners = this.matches.map(m => m.winner!).filter(Boolean);
    if (this.winners.length === 1) {
      console.log(`Tournament Winner: ${this.winners[0].displayName}`);
      // Optionally notify host:
      this.playerChannel.emit("tournamentFinished", this.winners[0].displayName);
      return;
    }
    
    if (this.tournamentType == TournamentType.Random) {
      let count = 0;
      this.winners.forEach(player => {
        count+= 1;
        player.isReady = false;
        const pool = getRandomPool(3);
        log_event("Random Pool: ");
        console.log(pool);
        player.currentMonsterPool = pool;
        this.playerChannel.to(player.socketId).emit("requestMonsterSelection", { monsterPool: pool });
      });
      await this.waitForMonsterSelections(this.winners);
      console.log("poopoo");
    }

    // Recursively run next round with winners
    this.runRounds(this.winners);
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

  public surrenderPlayerBySocket(socketId: string) {
        for (const match of this.matches) {
            const player =
                match.player1.socketId === socketId ? match.player1 :
                match.player2?.socketId === socketId ? match.player2 : undefined;

            if (player && !match.winner) {
                match.surrender(player, this.playerChannel);
                break; // player can only be in one match
            }
        }
    }
}