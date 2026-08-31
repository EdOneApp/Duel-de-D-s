// Persistance locale de la partie en cours (localStorage). Aucune donnée ne quitte l'appareil.

import type { BonusRules, GameState } from './types';

const GAME_KEY = 'duel-de-des:game:v1';
const SETUP_KEY = 'duel-de-des:pending-setup:v1';
const MUTE_KEY = 'duel-de-des:muted:v1';

export type PendingSetup = {
  p1: string;
  p2: string;
  bonus: BonusRules;
  maxRounds: number;
  startingBalance: number;
};

function hasWindow(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function saveGame(state: GameState): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch {
    /* quota / mode privé : on ignore */
  }
}

function isValidGame(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<GameState>;
  return (
    Array.isArray(s.players) &&
    s.players.length === 2 &&
    typeof s.phase === 'string' &&
    typeof s.round === 'number' &&
    Array.isArray(s.history)
  );
}

export function loadGame(): GameState | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidGame(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(GAME_KEY);
  } catch {
    /* ignore */
  }
}

export function savePendingSetup(setup: PendingSetup): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
  } catch {
    /* ignore */
  }
}

export function loadPendingSetup(): PendingSetup | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(SETUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSetup;
    if (!parsed || typeof parsed.p1 !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSetup(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(SETUP_KEY);
  } catch {
    /* ignore */
  }
}

export function loadMuted(): boolean {
  if (!hasWindow()) return false;
  return window.localStorage.getItem(MUTE_KEY) === '1';
}

export function saveMuted(muted: boolean): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* ignore */
  }
}
