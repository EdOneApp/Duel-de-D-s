// Modèle de données du jeu "Duel de Dés".

export type Player = { name: string; balance: number };

export type BonusRules = {
  /** Double 6 -> gain automatique du round + bonus de 50% du pot. */
  doubleSix: boolean;
  /** Double 1 -> perte automatique du round. */
  doubleOne: boolean;
};

export type Phase =
  | 'setup'
  | 'betting'
  | 'rolling-p1'
  | 'passing'
  | 'rolling-p2'
  | 'reveal'
  | 'gameover';

export type Die = 1 | 2 | 3 | 4 | 5 | 6;
export type Roll = [Die, Die];

export type RoundOutcome = 0 | 1 | 'tie';

export type HistoryEntry = {
  round: number;
  p1: Roll;
  p2: Roll;
  winner: RoundOutcome;
  winnerName: string;
  /** Jetons transférés au gagnant (0 en cas d'égalité). */
  amount: number;
  note?: string;
};

export type GameStats = {
  roundsPlayed: number;
  ties: number;
  biggestWin: { amount: number; name: string } | null;
};

export type GameState = {
  players: [Player, Player];
  round: number;
  maxRounds: number;
  startingBalance: number;
  minBet: number;
  maxBet: number;
  currentBet: number;
  /** Pot de la manche en cours (mises engagées x2 + report). */
  pot: number;
  /** Jetons reportés d'une égalité vers la manche suivante. */
  carry: number;
  turn: 0 | 1;
  phase: Phase;
  bonus: BonusRules;
  lastRoll: { p1: Roll | null; p2: Roll | null };
  history: HistoryEntry[];
  stats: GameStats;
  /** Gagnant global de la partie une fois `phase === 'gameover'`. */
  winner: 0 | 1 | null;
  /** Vrai si la partie se termine à égalité parfaite (limite de manches). */
  isDraw: boolean;
};

export type Action =
  | {
      type: 'SETUP';
      p1: string;
      p2: string;
      bonus: BonusRules;
      maxRounds: number;
      startingBalance: number;
      minBet?: number;
      maxBet?: number;
    }
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'ROLL_P1'; roll?: Roll }
  | { type: 'CONFIRM_PASS' }
  | { type: 'ROLL_P2'; roll?: Roll }
  | { type: 'RESOLVE_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: GameState };
