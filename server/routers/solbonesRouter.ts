/**
 * Solbones 4+3+2 Game Router
 * Official rules implementation with exact scoring mechanics
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Frequency die values: Red=2, Purple=3, Blue=4
type FrequencyDie = 'red' | 'purple' | 'blue';

interface DiceRoll {
  die1: number; // 1-6
  die2: number; // 1-6
  die3: number; // 1-6
  frequencyDie?: FrequencyDie; // Optional frequency die (2, 3, or 4)
}

interface RoundScore {
  rollNumber: number;
  diceRoll: DiceRoll;
  points: number;
  tallies: number;
  scoringType: string;
}

interface GameSession {
  sessionId: string;
  players: Array<{
    playerId: string;
    playerName: string;
    totalScore: number;
    roundScores: RoundScore[];
    talliesRemaining: number;
    hasRolledInFinalRound: boolean;
  }>;
  currentPlayerIndex: number;
  gameStatus: 'active' | 'final_round' | 'completed';
  winnerScore: number | null;
  winnerId: string | null;
  createdAt: Date;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  gamesWon: number;
  level: number;
  badges: string[];
}

interface Tournament {
  id: string;
  name: string;
  status: 'registration' | 'active' | 'completed';
  maxPlayers: number;
  players: string[];
  rounds: number;
  leaderboard: Array<{ playerId: string; playerName: string; score: number }>;
}

// In-memory storage
const gameSessions: Map<string, GameSession> = new Map();
const playerStats: Map<string, PlayerStats> = new Map();
const tournaments: Tournament[] = [
  {
    id: 'tournament-1',
    name: 'RRB Spring Championship',
    status: 'active',
    maxPlayers: 64,
    players: [],
    rounds: 5,
    leaderboard: [],
  },
  {
    id: 'tournament-2',
    name: 'Healing Frequencies Cup',
    status: 'active',
    maxPlayers: 32,
    players: [],
    rounds: 3,
    leaderboard: [],
  },
];

/**
 * Calculate score for a single roll based on official Solbones 4+3+2 rules
 */
function calculateRoundScore(diceRoll: DiceRoll): { points: number; tallies: number; scoringType: string } {
  const { die1, die2, die3, frequencyDie } = diceRoll;
  const dice = [die1, die2, die3].sort();

  // Check for Tribing Up (all 3 dice the same)
  if (die1 === die2 && die2 === die3) {
    const baseValue = die1;
    let points = baseValue;
    let tallies = 1;

    // If it's a frequency die, double the value
    if (frequencyDie) {
      points = baseValue * 2;
    }

    return {
      points,
      tallies,
      scoringType: `Tribing Up (${baseValue}s) - ${frequencyDie ? 'Frequency' : 'Regular'}`,
    };
  }

  // Check for Roll a Pair (two dice the same)
  if (die1 === die2 || die2 === die3 || die1 === die3) {
    let scoringDie = 0;

    if (die1 === die2) {
      scoringDie = die3;
    } else if (die2 === die3) {
      scoringDie = die1;
    } else {
      scoringDie = die2;
    }

    let points = scoringDie;

    // If scoring die is frequency die, double it
    if (frequencyDie && scoringDie === (frequencyDie === 'red' ? 2 : frequencyDie === 'purple' ? 3 : 4)) {
      points = scoringDie * 2;
    }

    return {
      points,
      tallies: 0,
      scoringType: `Roll a Pair - Third die: ${scoringDie}${frequencyDie ? ` (${frequencyDie})` : ''}`,
    };
  }

  // Check for In the Ether (4+3+2 = 9 points + 1 tally)
  if ((dice[0] === 2 && dice[1] === 3 && dice[2] === 4) || 
      (die1 === 4 && die2 === 3 && die3 === 2) ||
      (die1 === 4 && die2 === 2 && die3 === 3) ||
      (die1 === 3 && die2 === 4 && die3 === 2) ||
      (die1 === 3 && die2 === 2 && die3 === 4) ||
      (die1 === 2 && die2 === 4 && die3 === 3) ||
      (die1 === 2 && die2 === 3 && die3 === 4)) {
    return {
      points: 9,
      tallies: 1,
      scoringType: 'In the Ether (4+3+2)',
    };
  }

  // Check for Zan Zone (4+3+2 with ALL frequency dice = 18 points + 2 tallies)
  // This requires all three dice to be frequency values (2, 3, 4) with frequency die active
  if (frequencyDie && dice[0] === 2 && dice[1] === 3 && dice[2] === 4) {
    return {
      points: 18,
      tallies: 2,
      scoringType: 'Zan Zone (4+3+2 with all frequency)',
    };
  }

  // No scoring combination
  return {
    points: 0,
    tallies: 0,
    scoringType: 'No score',
  };
}

export const solbonesRouter = router({
  /**
   * Start a new game session
   */
  startGame: protectedProcedure
    .input(z.object({
      playerNames: z.array(z.string()).min(1).max(9),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessionId = `game-${Date.now()}`;

      const session: GameSession = {
        sessionId,
        players: input.playerNames.map((name, idx) => ({
          playerId: `player-${idx}`,
          playerName: name,
          totalScore: 0,
          roundScores: [],
          talliesRemaining: 0,
          hasRolledInFinalRound: false,
        })),
        currentPlayerIndex: 0,
        gameStatus: 'active',
        winnerScore: null,
        winnerId: null,
        createdAt: new Date(),
      };

      gameSessions.set(sessionId, session);

      return {
        sessionId,
        currentPlayer: session.players[0],
        gameStatus: session.gameStatus,
      };
    }),

  /**
   * Roll dice and score
   */
  rollDice: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      die1: z.number().min(1).max(6),
      die2: z.number().min(1).max(6),
      die3: z.number().min(1).max(6),
      frequencyDie: z.enum(['red', 'purple', 'blue']).optional(),
      useTally: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = gameSessions.get(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game session not found' });
      }

      const currentPlayer = session.players[session.currentPlayerIndex];
      const diceRoll: DiceRoll = {
        die1: input.die1,
        die2: input.die2,
        die3: input.die3,
        frequencyDie: input.frequencyDie,
      };

      // Check tally usage rules
      if (input.useTally) {
        if (currentPlayer.talliesRemaining <= 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No tallies available',
          });
        }
        currentPlayer.talliesRemaining--;
      }

      const { points, tallies, scoringType } = calculateRoundScore(diceRoll);

      // Add to round scores
      const roundScore: RoundScore = {
        rollNumber: currentPlayer.roundScores.length + 1,
        diceRoll,
        points,
        tallies,
        scoringType,
      };

      currentPlayer.roundScores.push(roundScore);
      currentPlayer.totalScore += points;
      currentPlayer.talliesRemaining += tallies;

      // Check if player won (63+ points)
      let gameStatus = session.gameStatus;
      if (currentPlayer.totalScore >= 63 && session.gameStatus === 'active') {
        session.gameStatus = 'final_round';
        session.winnerScore = currentPlayer.totalScore;
        session.winnerId = currentPlayer.playerId;
      }

      return {
        roundScore,
        playerScore: currentPlayer.totalScore,
        talliesRemaining: currentPlayer.talliesRemaining,
        gameStatus,
        message: points > 0 ? `Scored ${points} points!` : 'No score this roll',
      };
    }),

  /**
   * End current player's turn
   */
  endTurn: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = gameSessions.get(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game session not found' });
      }

      const currentPlayer = session.players[session.currentPlayerIndex];
      const roundScore = currentPlayer.roundScores.reduce((sum, r) => sum + r.points, 0);

      // Pass the point rule: if no score this round, next player gets 1 point
      if (roundScore === 0 && currentPlayer.roundScores.length > 0) {
        const nextIdx = (session.currentPlayerIndex + 1) % session.players.length;
        session.players[nextIdx].totalScore += 1;
      }

      // Reset round scores for next player
      currentPlayer.roundScores = [];

      // Move to next player
      session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length;

      // Check if we're in final round
      if (session.gameStatus === 'final_round') {
        const nextPlayer = session.players[session.currentPlayerIndex];
        nextPlayer.hasRolledInFinalRound = true;

        // Check if all players have rolled in final round
        if (session.players.every(p => p.hasRolledInFinalRound)) {
          session.gameStatus = 'completed';
        }
      }

      return {
        nextPlayer: session.players[session.currentPlayerIndex],
        gameStatus: session.gameStatus,
      };
    }),

  /**
   * Get game state
   */
  getGameState: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = gameSessions.get(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Game session not found' });
      }

      return {
        sessionId: session.sessionId,
        players: session.players.map(p => ({
          playerId: p.playerId,
          playerName: p.playerName,
          totalScore: p.totalScore,
          talliesRemaining: p.talliesRemaining,
        })),
        currentPlayer: session.players[session.currentPlayerIndex],
        gameStatus: session.gameStatus,
        winnerScore: session.winnerScore,
        winnerId: session.winnerId,
      };
    }),

  /**
   * Get player statistics
   */
  getPlayerStats: publicProcedure
    .input(z.object({
      playerId: z.string(),
    }))
    .query(async ({ input }) => {
      let stats = playerStats.get(input.playerId);

      if (!stats) {
        stats = {
          playerId: input.playerId,
          playerName: 'Unknown Player',
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          highestScore: 0,
          gamesWon: 0,
          level: 1,
          badges: [],
        };
      }

      return stats;
    }),

  /**
   * Get leaderboard
   */
  getLeaderboard: publicProcedure
    .input(z.object({
      sortBy: z.enum(['totalScore', 'highestScore', 'averageScore', 'gamesWon']).default('totalScore'),
      limit: z.number().default(10),
    }))
    .query(async () => {
      const stats = Array.from(playerStats.values());

      stats.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
        return b.highestScore - a.highestScore;
      });

      return stats.slice(0, 10).map((stat, idx) => ({
        rank: idx + 1,
        playerName: stat.playerName,
        totalScore: stat.totalScore,
        highestScore: stat.highestScore,
        gamesWon: stat.gamesWon,
        level: stat.level,
        badges: stat.badges,
      }));
    }),

  /**
   * Get tournaments
   */
  getTournaments: publicProcedure.query(async () => {
    return tournaments.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      maxPlayers: t.maxPlayers,
      playerCount: t.players.length,
      rounds: t.rounds,
    }));
  }),

  /**
   * Join tournament
   */
  joinTournament: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tournament = tournaments.find(t => t.id === input.tournamentId);
      if (!tournament) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tournament not found' });
      }

      if (tournament.players.length >= tournament.maxPlayers) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tournament is full' });
      }

      const playerId = ctx.user?.id.toString() || `guest-${Date.now()}`;
      if (!tournament.players.includes(playerId)) {
        tournament.players.push(playerId);
      }

      return {
        tournamentId: tournament.id,
        playerCount: tournament.players.length,
        maxPlayers: tournament.maxPlayers,
      };
    }),

  /**
   * Get frequency reference
   */
  getFrequencyReference: publicProcedure.query(async () => {
    return [
      { diceValue: 2, frequency: 174, note: 'UT', color: 'red', description: 'Foundation & Security' },
      { diceValue: 3, frequency: 285, note: 'RE', color: 'purple', description: 'Tissue Repair' },
      { diceValue: 4, frequency: 432, note: 'FA', color: 'blue', description: 'Heart Chakra' },
      { diceValue: 5, frequency: 528, note: 'SOL', color: 'yellow', description: 'DNA Repair' },
      { diceValue: 6, frequency: 639, note: 'LA', color: 'green', description: 'Cell Communication' },
      { diceValue: 7, frequency: 741, note: 'TI', color: 'indigo', description: 'Intuition & Insight' },
      { diceValue: 8, frequency: 852, note: 'DO', color: 'violet', description: 'Spiritual Awakening' },
    ];
  }),

  /**
   * Get game rules
   */
  getGameRules: publicProcedure.query(async () => {
    return {
      winCondition: '63+ points',
      rollsPerRound: 3,
      talliesPerRound: 1,
      scoringOptions: [
        {
          name: 'Roll a Pair',
          description: 'Two dice the same = third die is your score',
          example: '2 6s and a 3 = 3 points',
        },
        {
          name: 'Tribing Up',
          description: 'All 3 dice the same = 1 die value + 1 tally',
          example: 'Three 4s = 4 points + 1 tally',
        },
        {
          name: 'Vibing Up',
          description: 'Frequency die as scorer = double the value + 1 tally if trips',
          example: 'Two 6s and purple 3 = 6 points (3 × 2)',
        },
        {
          name: 'In the Ether',
          description: 'Roll 4+3+2 = 9 points + 1 tally',
          example: '4, 3, 2 in any order = 9 points',
        },
        {
          name: 'Zan Zone',
          description: 'Roll 4+3+2 with all frequency = 18 points + 2 tallies',
          example: 'Blue 4, Purple 3, Red 2 = 18 points',
        },
      ],
      endgame: 'After first player reaches 63+, all other players get one final round to beat that score',
      tiebreaker: 'Each player rolls 1 die; highest wins',
    };
  }),
});

export type SolbonesRouter = typeof solbonesRouter;
