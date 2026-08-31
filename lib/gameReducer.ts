// Logique pure du jeu "Duel de Dés" — testable isolément, aucune dépendance UI.

import type {
  Action,
  BonusRules,
  Die,
  GameState,
  HistoryEntry,
  Roll,
  RoundOutcome,
} from './types';

export const DEFAULTS = {
  startingBalance: 500,
  minBet: 10,
  maxBet: 100,
  maxRounds: 10,
} as const;

export function rollDie(): Die {
  return ((Math.floor(Math.random() * 6) + 1) as Die);
}

export function rollDice(): Roll {
  return [rollDie(), rollDie()];
}

export function sum(roll: Roll): number {
  return roll[0] + roll[1];
}

function isDouble(roll: Roll, face: Die): boolean {
  return roll[0] === face && roll[1] === face;
}

export function createInitialState(): GameState {
  return {
    players: [
      { name: 'Joueur 1', balance: DEFAULTS.startingBalance },
      { name: 'Joueur 2', balance: DEFAULTS.startingBalance },
    ],
    round: 0,
    maxRounds: DEFAULTS.maxRounds,
    startingBalance: DEFAULTS.startingBalance,
    minBet: DEFAULTS.minBet,
    maxBet: DEFAULTS.maxBet,
    currentBet: DEFAULTS.minBet,
    pot: 0,
    carry: 0,
    turn: 0,
    phase: 'setup',
    bonus: { doubleSix: false, doubleOne: false },
    lastRoll: { p1: null, p2: null },
    history: [],
    stats: { roundsPlayed: 0, ties: 0, biggestWin: null },
    winner: null,
    isDraw: false,
  };
}

/** Plafond de mise: borne haute configurée, limitée au solde du joueur le plus pauvre. */
export function maxAffordableBet(state: GameState): number {
  const poorest = Math.min(state.players[0].balance, state.players[1].balance);
  return Math.max(0, Math.min(state.maxBet, poorest));
}

export function betBounds(state: GameState): { min: number; max: number } {
  const max = maxAffordableBet(state);
  const min = Math.min(state.minBet, max);
  return { min, max };
}

function clampBet(state: GameState, amount: number): number | null {
  const { min, max } = betBounds(state);
  if (max <= 0) return null;
  const rounded = Math.round(amount);
  if (Number.isNaN(rounded)) return null;
  if (rounded < min || rounded > max) return null;
  return rounded;
}

type ForcedResult = 'win' | 'lose' | null;

function forcedResult(roll: Roll, bonus: BonusRules): ForcedResult {
  if (bonus.doubleSix && isDouble(roll, 6)) return 'win';
  if (bonus.doubleOne && isDouble(roll, 1)) return 'lose';
  return null;
}

type Resolution = {
  outcome: RoundOutcome;
  /** Bonus "double 6" déclenché par le gagnant. */
  doubleSixBonus: boolean;
  note?: string;
};

export function resolveRolls(
  p1: Roll,
  p2: Roll,
  bonus: BonusRules,
): Resolution {
  const f1 = forcedResult(p1, bonus);
  const f2 = forcedResult(p2, bonus);

  if (f1 || f2) {
    // Priorité: "win" (double 6) l'emporte sur "lose" (double 1).
    const score = (f: ForcedResult): number => (f === 'win' ? 1 : f === 'lose' ? -1 : 0);
    const s1 = score(f1);
    const s2 = score(f2);
    if (s1 === s2) {
      return { outcome: 'tie', doubleSixBonus: false, note: 'Règle bonus — égalité' };
    }
    const winner: 0 | 1 = s1 > s2 ? 0 : 1;
    const winnerForced = winner === 0 ? f1 : f2;
    if (winnerForced === 'win') {
      return { outcome: winner, doubleSixBonus: true, note: 'Double 6 — gain automatique +50%' };
    }
    // Le gagnant gagne parce que l'adversaire a fait un double 1.
    return { outcome: winner, doubleSixBonus: false, note: 'Double 1 — perte automatique' };
  }

  const d = sum(p1) - sum(p2);
  if (d === 0) return { outcome: 'tie', doubleSixBonus: false, note: 'Égalité — cagnotte reportée' };
  return { outcome: d > 0 ? 0 : 1, doubleSixBonus: false };
}

function withEndCheck(state: GameState): GameState {
  const [a, b] = state.players;

  // Faillite d'un joueur.
  if (a.balance <= 0 || b.balance <= 0) {
    const winner: 0 | 1 = a.balance <= 0 ? 1 : 0;
    return { ...state, phase: 'gameover', winner, isDraw: false };
  }

  // Nombre de manches maximum atteint.
  if (state.round >= state.maxRounds) {
    if (a.balance === b.balance) {
      return { ...state, phase: 'gameover', winner: null, isDraw: true };
    }
    const winner: 0 | 1 = a.balance > b.balance ? 0 : 1;
    return { ...state, phase: 'gameover', winner, isDraw: false };
  }

  return state;
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'RESET':
      return createInitialState();

    case 'SETUP': {
      const startingBalance =
        action.startingBalance > 0 ? Math.round(action.startingBalance) : DEFAULTS.startingBalance;
      const maxRounds = action.maxRounds > 0 ? Math.round(action.maxRounds) : DEFAULTS.maxRounds;
      const minBet = Math.max(1, Math.round(action.minBet ?? DEFAULTS.minBet));
      const maxBet = Math.max(minBet, Math.round(action.maxBet ?? DEFAULTS.maxBet));
      const p1 = action.p1.trim() || 'Joueur 1';
      const p2 = action.p2.trim() || 'Joueur 2';
      return {
        ...createInitialState(),
        players: [
          { name: p1, balance: startingBalance },
          { name: p2, balance: startingBalance },
        ],
        startingBalance,
        maxRounds,
        minBet,
        maxBet,
        currentBet: Math.min(minBet, startingBalance),
        bonus: { ...action.bonus },
        round: 1,
        phase: 'betting',
        turn: 0,
      };
    }

    case 'PLACE_BET': {
      if (state.phase !== 'betting') return state;
      const bet = clampBet(state, action.amount);
      if (bet === null) return state;
      return {
        ...state,
        currentBet: bet,
        players: [
          { ...state.players[0], balance: state.players[0].balance - bet },
          { ...state.players[1], balance: state.players[1].balance - bet },
        ],
        pot: bet * 2 + state.carry,
        carry: 0,
        phase: 'rolling-p1',
        turn: 0,
        lastRoll: { p1: null, p2: null },
      };
    }

    case 'ROLL_P1': {
      if (state.phase !== 'rolling-p1') return state;
      const roll = action.roll ?? rollDice();
      return {
        ...state,
        lastRoll: { ...state.lastRoll, p1: roll },
        phase: 'passing',
        turn: 1,
      };
    }

    case 'CONFIRM_PASS': {
      if (state.phase !== 'passing') return state;
      return { ...state, phase: 'rolling-p2', turn: 1 };
    }

    case 'ROLL_P2': {
      if (state.phase !== 'rolling-p2') return state;
      const roll = action.roll ?? rollDice();
      return {
        ...state,
        lastRoll: { ...state.lastRoll, p2: roll },
        phase: 'reveal',
      };
    }

    case 'RESOLVE_ROUND': {
      if (state.phase !== 'reveal') return state;
      const p1 = state.lastRoll.p1;
      const p2 = state.lastRoll.p2;
      if (!p1 || !p2) return state;

      const { outcome, doubleSixBonus, note } = resolveRolls(p1, p2, state.bonus);
      const players: [typeof state.players[0], typeof state.players[1]] = [
        { ...state.players[0] },
        { ...state.players[1] },
      ];
      const stats = { ...state.stats };
      stats.roundsPlayed += 1;

      let amount = 0;
      let carry = 0;
      let winnerName = 'Égalité';

      if (outcome === 'tie') {
        // La mise reste engagée: elle grossit la cagnotte de la manche suivante.
        carry = state.pot;
        stats.ties += 1;
      } else {
        const w = outcome;
        const l = (outcome === 0 ? 1 : 0) as 0 | 1;
        amount = state.pot;
        if (doubleSixBonus) {
          const wanted = Math.floor(state.pot * 0.5);
          const taken = Math.min(wanted, Math.max(0, players[l].balance));
          players[l].balance -= taken;
          amount += taken;
        }
        players[w].balance += amount;
        winnerName = players[w].name;
        if (!stats.biggestWin || amount > stats.biggestWin.amount) {
          stats.biggestWin = { amount, name: players[w].name };
        }
      }

      const entry: HistoryEntry = {
        round: state.round,
        p1,
        p2,
        winner: outcome,
        winnerName,
        amount,
        note,
      };

      const next: GameState = {
        ...state,
        players,
        pot: 0,
        carry,
        stats,
        history: [...state.history, entry],
        phase: 'reveal',
      };

      return withEndCheck(next);
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'reveal') return state;
      return {
        ...state,
        round: state.round + 1,
        phase: 'betting',
        turn: 0,
        lastRoll: { p1: null, p2: null },
        currentBet: Math.max(betBounds(state).min, Math.min(state.currentBet, betBounds(state).max)),
      };
    }

    default:
      return state;
  }
}
