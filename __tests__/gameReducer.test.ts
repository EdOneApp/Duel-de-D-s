import { describe, expect, it } from 'vitest';
import {
  DEFAULTS,
  betBounds,
  createInitialState,
  gameReducer,
  maxAffordableBet,
  resolveRolls,
} from '../lib/gameReducer';
import type { Action, BonusRules, GameState, Roll } from '../lib/types';

const NO_BONUS: BonusRules = { doubleSix: false, doubleOne: false };

function setup(overrides: Partial<Parameters<typeof gameReducer>[1] & { bonus: BonusRules }> = {}): GameState {
  return gameReducer(createInitialState(), {
    type: 'SETUP',
    p1: 'Alex',
    p2: 'Sam',
    bonus: NO_BONUS,
    maxRounds: DEFAULTS.maxRounds,
    startingBalance: DEFAULTS.startingBalance,
    ...overrides,
  } as Action);
}

/** Joue une manche complète avec des lancers imposés. */
function playRound(state: GameState, bet: number, p1: Roll, p2: Roll): GameState {
  let s = gameReducer(state, { type: 'PLACE_BET', amount: bet });
  s = gameReducer(s, { type: 'ROLL_P1', roll: p1 });
  s = gameReducer(s, { type: 'CONFIRM_PASS' });
  s = gameReducer(s, { type: 'ROLL_P2', roll: p2 });
  s = gameReducer(s, { type: 'RESOLVE_ROUND' });
  return s;
}

describe('SETUP', () => {
  it('initialise une partie jouable', () => {
    const s = setup();
    expect(s.phase).toBe('betting');
    expect(s.round).toBe(1);
    expect(s.players.map((p) => p.name)).toEqual(['Alex', 'Sam']);
    expect(s.players.every((p) => p.balance === 500)).toBe(true);
    expect(s.pot).toBe(0);
  });

  it('retombe sur des noms par défaut si vides', () => {
    const s = setup({ p1: '   ', p2: '' });
    expect(s.players.map((p) => p.name)).toEqual(['Joueur 1', 'Joueur 2']);
  });
});

describe('PLACE_BET', () => {
  it('engage la mise des deux joueurs et remplit le pot', () => {
    const s = gameReducer(setup(), { type: 'PLACE_BET', amount: 50 });
    expect(s.phase).toBe('rolling-p1');
    expect(s.players[0].balance).toBe(450);
    expect(s.players[1].balance).toBe(450);
    expect(s.pot).toBe(100);
  });

  it('refuse une mise sous le minimum', () => {
    const base = setup();
    const s = gameReducer(base, { type: 'PLACE_BET', amount: 1 });
    expect(s).toBe(base);
  });

  it('refuse une mise au-dessus du plafond', () => {
    const base = setup();
    const s = gameReducer(base, { type: 'PLACE_BET', amount: 999 });
    expect(s).toBe(base);
  });

  it('refuse une mise hors de la phase betting', () => {
    const rolling = gameReducer(setup(), { type: 'PLACE_BET', amount: 20 });
    const s = gameReducer(rolling, { type: 'PLACE_BET', amount: 20 });
    expect(s).toBe(rolling);
  });

  it('plafonne la mise au solde du joueur le plus pauvre', () => {
    let s = setup({ startingBalance: 30, maxBet: 100 });
    expect(maxAffordableBet(s)).toBe(30);
    expect(betBounds(s)).toEqual({ min: 10, max: 30 });
    s = gameReducer(s, { type: 'PLACE_BET', amount: 30 });
    expect(s.phase).toBe('rolling-p1');
    expect(s.players[0].balance).toBe(0);
  });
});

describe('déroulement d’une manche', () => {
  it('la somme la plus haute remporte le pot (2x la mise)', () => {
    const s = playRound(setup(), 40, [6, 5], [2, 3]);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].winner).toBe(0);
    expect(s.history[0].winnerName).toBe('Alex');
    expect(s.history[0].amount).toBe(80);
    expect(s.players[0].balance).toBe(540); // 500 - 40 + 80
    expect(s.players[1].balance).toBe(460); // 500 - 40
    expect(s.pot).toBe(0);
  });

  it('le joueur 2 peut gagner', () => {
    const s = playRound(setup(), 40, [1, 2], [6, 6]);
    expect(s.history[0].winner).toBe(1);
    expect(s.players[1].balance).toBe(540);
  });

  it('les transitions de phase s’enchaînent correctement', () => {
    let s = gameReducer(setup(), { type: 'PLACE_BET', amount: 20 });
    expect(s.phase).toBe('rolling-p1');
    s = gameReducer(s, { type: 'ROLL_P1', roll: [3, 3] });
    expect(s.phase).toBe('passing');
    expect(s.turn).toBe(1);
    s = gameReducer(s, { type: 'CONFIRM_PASS' });
    expect(s.phase).toBe('rolling-p2');
    s = gameReducer(s, { type: 'ROLL_P2', roll: [2, 2] });
    expect(s.phase).toBe('reveal');
    s = gameReducer(s, { type: 'RESOLVE_ROUND' });
    expect(s.phase).toBe('reveal');
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    expect(s.phase).toBe('betting');
    expect(s.round).toBe(2);
  });
});

describe('égalité (cagnotte)', () => {
  it('reporte la mise sur la manche suivante sans toucher aux soldes', () => {
    let s = playRound(setup(), 30, [3, 4], [5, 2]); // sommes égales = 7
    expect(s.history[0].winner).toBe('tie');
    expect(s.stats.ties).toBe(1);
    expect(s.carry).toBe(60);
    expect(s.pot).toBe(0);
    expect(s.players[0].balance).toBe(470);
    expect(s.players[1].balance).toBe(470);

    s = gameReducer(s, { type: 'NEXT_ROUND' });
    s = gameReducer(s, { type: 'PLACE_BET', amount: 30 });
    // pot = mise x2 + report
    expect(s.pot).toBe(120);
    expect(s.carry).toBe(0);
  });

  it('la cagnotte grossit sur deux égalités consécutives', () => {
    let s = playRound(setup(), 20, [1, 6], [2, 5]); // 7-7
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    s = playRound(s, 20, [4, 4], [3, 5]); // 8-8
    expect(s.carry).toBe(80); // 40 (report) + 40 (nouvelle mise x2)
  });
});

describe('règles bonus', () => {
  it('double 6 : gain automatique + bonus de 50% du pot', () => {
    const s = playRound(setup({ bonus: { doubleSix: true, doubleOne: false } }), 40, [6, 6], [6, 6]);
    // Les deux ont fait double 6 -> égalité
    expect(s.history[0].winner).toBe('tie');
  });

  it('double 6 contre un lancer normal : bonus appliqué', () => {
    const s = playRound(
      setup({ bonus: { doubleSix: true, doubleOne: false } }),
      40,
      [6, 6],
      [3, 4],
    );
    expect(s.history[0].winner).toBe(0);
    // pot = 80 ; bonus = floor(80 * 0.5) = 40 pris sur l'adversaire
    expect(s.history[0].amount).toBe(120);
    expect(s.players[0].balance).toBe(500 - 40 + 120);
    expect(s.players[1].balance).toBe(500 - 40 - 40);
  });

  it('double 1 : perte automatique du round', () => {
    const s = playRound(
      setup({ bonus: { doubleSix: false, doubleOne: true } }),
      40,
      [1, 1],
      [1, 2],
    );
    expect(s.history[0].winner).toBe(1);
    expect(s.history[0].note).toContain('Double 1');
  });

  it('double 6 l’emporte sur double 1', () => {
    const s = playRound(
      setup({ bonus: { doubleSix: true, doubleOne: true } }),
      40,
      [6, 6],
      [1, 1],
    );
    expect(s.history[0].winner).toBe(0);
  });

  it('les doubles ne comptent pas si la règle est désactivée', () => {
    const s = playRound(setup(), 40, [6, 6], [1, 1]);
    expect(s.history[0].winner).toBe(0); // simple comparaison 12 > 2
    expect(s.history[0].amount).toBe(80); // pas de bonus
  });
});

describe('resolveRolls (unité)', () => {
  it('compare les sommes', () => {
    expect(resolveRolls([5, 5], [3, 2], NO_BONUS).outcome).toBe(0);
    expect(resolveRolls([2, 2], [3, 2], NO_BONUS).outcome).toBe(1);
    expect(resolveRolls([3, 4], [5, 2], NO_BONUS).outcome).toBe('tie');
  });
});

describe('fin de partie', () => {
  it('un joueur à 0 jeton -> l’autre gagne', () => {
    let s = setup({ startingBalance: 100 });
    // Alex mise et perd 100 -> solde 0
    s = playRound(s, 100, [1, 1], [6, 6]);
    expect(s.phase).toBe('gameover');
    expect(s.winner).toBe(1);
    expect(s.isDraw).toBe(false);
  });

  it('limite de manches atteinte -> plus haut solde gagne', () => {
    let s = setup({ maxRounds: 1 });
    s = playRound(s, 50, [6, 6], [1, 2]); // Alex gagne, round 1 = maxRounds
    expect(s.phase).toBe('gameover');
    expect(s.winner).toBe(0);
  });

  it('limite de manches atteinte avec soldes égaux -> match nul', () => {
    let s = setup({ maxRounds: 1 });
    s = playRound(s, 50, [3, 3], [4, 2]); // égalité: soldes identiques
    expect(s.phase).toBe('gameover');
    expect(s.winner).toBeNull();
    expect(s.isDraw).toBe(true);
  });
});

describe('RESET / HYDRATE', () => {
  it('RESET revient à l’écran de configuration', () => {
    const s = gameReducer(setup(), { type: 'RESET' });
    expect(s.phase).toBe('setup');
    expect(s.round).toBe(0);
  });

  it('HYDRATE restaure un état fourni', () => {
    const saved = playRound(setup(), 20, [6, 1], [2, 2]);
    const s = gameReducer(createInitialState(), { type: 'HYDRATE', state: saved });
    expect(s).toEqual(saved);
  });
});

describe('statistiques', () => {
  it('suit le plus gros gain et le nombre de manches', () => {
    let s = setup({ maxRounds: 5 });
    s = playRound(s, 20, [6, 6], [1, 1]); // Alex +40
    s = gameReducer(s, { type: 'NEXT_ROUND' });
    s = playRound(s, 60, [5, 5], [1, 1]); // Alex +120
    expect(s.stats.roundsPlayed).toBe(2);
    expect(s.stats.biggestWin).toEqual({ amount: 120, name: 'Alex' });
  });
});
