/**
 * Solbones Dice Game Service
 * Sacred math 4+3+2 dice game with Qumus AI
 */

export interface DiceRoll {
  dice4: number;
  dice3: number;
  dice2: number;
  total: number;
  timestamp: string;
}

export interface GamePlayer {
  id: number;
  name: string;
  score: number;
  isAI: boolean;
}

export interface GameState {
  id: string;
  players: GamePlayer[];
  currentPlayerIndex: number;
  rolls: DiceRoll[];
  status: 'setup' | 'playing' | 'completed';
  createdAt: string;
}

class SolbonesGameService {
  private games: Map<string, GameState> = new Map();

  async createGame(playerNames: string[], aiCount: number = 0): Promise<GameState> {
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const players: GamePlayer[] = [
      ...playerNames.map((name, i) => ({
        id: i,
        name,
        score: 0,
        isAI: false,
      })),
      ...Array.from({ length: aiCount }, (_, i) => ({
        id: playerNames.length + i,
        name: `AI Player ${i + 1}`,
        score: 0,
        isAI: true,
      })),
    ];

    const gameState: GameState = {
      id: gameId,
      players,
      currentPlayerIndex: 0,
      rolls: [],
      status: 'playing',
      createdAt: new Date().toISOString(),
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  async rollDice(gameId: string): Promise<DiceRoll> {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');

    const roll: DiceRoll = {
      dice4: Math.floor(Math.random() * 4) + 1,
      dice3: Math.floor(Math.random() * 3) + 1,
      dice2: Math.floor(Math.random() * 2) + 1,
      total: 0,
      timestamp: new Date().toISOString(),
    };

    roll.total = roll.dice4 + roll.dice3 + roll.dice2;

    const currentPlayer = game.players[game.currentPlayerIndex];
    currentPlayer.score += roll.total;

    game.rolls.push(roll);
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    return roll;
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    return this.games.get(gameId) || null;
  }

  async endGame(gameId: string): Promise<GamePlayer> {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');

    game.status = 'completed';
    const winner = game.players.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    return winner;
  }
}

export const solbonesGameService = new SolbonesGameService();
