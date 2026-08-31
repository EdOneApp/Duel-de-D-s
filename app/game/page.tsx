'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import BetSlider from '@/components/BetSlider';
import Dice from '@/components/Dice';
import HistoryLog from '@/components/HistoryLog';
import MuteButton from '@/components/MuteButton';
import PassScreen from '@/components/PassScreen';
import PlayerPanel from '@/components/PlayerPanel';
import RoundResult from '@/components/RoundResult';
import VictoryScreen from '@/components/VictoryScreen';
import { betBounds, createInitialState, gameReducer } from '@/lib/gameReducer';
import { playRoll, playTie, playWin } from '@/lib/sound';
import {
  clearGame,
  clearPendingSetup,
  loadGame,
  loadPendingSetup,
  saveGame,
} from '@/lib/storage';

const ROLL_MS = 1200;

export default function GamePage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [ready, setReady] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [bet, setBet] = useState(state.currentBet);
  const [revealAck, setRevealAck] = useState(false);
  const [deltas, setDeltas] = useState<[number | null, number | null]>([null, null]);

  const prevBalances = useRef<[number, number]>([0, 0]);
  const historyLen = useRef(0);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInit = useRef(false);

  // --- Hydratation depuis localStorage ou depuis la config d'accueil ---
  // Garde `didInit` : idempotent, y compris sous le double-montage de React StrictMode.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const saved = loadGame();
    if (saved && saved.phase !== 'setup') {
      dispatch({ type: 'HYDRATE', state: saved });
      historyLen.current = saved.history.length;
      prevBalances.current = [saved.players[0].balance, saved.players[1].balance];
      setBet(saved.currentBet);
      setRevealAck(saved.phase === 'gameover');
      setReady(true);
      return;
    }
    const pending = loadPendingSetup();
    if (pending) {
      dispatch({ type: 'SETUP', ...pending });
      clearPendingSetup();
      setReady(true);
      return;
    }
    router.replace('/');
  }, [router]);

  // --- Persistance de la partie ---
  useEffect(() => {
    if (ready && state.phase !== 'setup') saveGame(state);
  }, [state, ready]);

  // --- Suivi des mises / bornes ---
  const bounds = betBounds(state);
  useEffect(() => {
    if (state.phase === 'betting') {
      prevBalances.current = [state.players[0].balance, state.players[1].balance];
      setBet((b) => Math.max(bounds.min, Math.min(bounds.max, b || state.currentBet)));
      setDeltas([null, null]);
      setRevealAck(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.round]);

  // --- Deltas de solde à la révélation ---
  useEffect(() => {
    if (state.phase === 'reveal' || state.phase === 'gameover') {
      setDeltas([
        state.players[0].balance - prevBalances.current[0],
        state.players[1].balance - prevBalances.current[1],
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // --- Sons de fin de manche ---
  useEffect(() => {
    if (state.history.length > historyLen.current) {
      const entry = state.history[state.history.length - 1];
      if (entry.winner === 'tie') playTie();
      else playWin();
      historyLen.current = state.history.length;
    }
  }, [state.history]);

  useEffect(() => {
    return () => {
      if (rollTimer.current) clearTimeout(rollTimer.current);
    };
  }, []);

  const doRoll = useCallback(
    (which: 'p1' | 'p2') => {
      if (rolling) return;
      setRolling(true);
      playRoll();
      rollTimer.current = setTimeout(() => {
        setRolling(false);
        if (which === 'p1') {
          dispatch({ type: 'ROLL_P1' });
        } else {
          dispatch({ type: 'ROLL_P2' });
          dispatch({ type: 'RESOLVE_ROUND' });
        }
      }, ROLL_MS);
    },
    [rolling],
  );

  const goHome = () => {
    router.push('/');
  };

  const replay = () => {
    clearGame();
    dispatch({
      type: 'SETUP',
      p1: state.players[0].name,
      p2: state.players[1].name,
      bonus: state.bonus,
      maxRounds: state.maxRounds,
      startingBalance: state.startingBalance,
      minBet: state.minBet,
      maxBet: state.maxBet,
    });
    historyLen.current = 0;
    prevBalances.current = [state.startingBalance, state.startingBalance];
    setRevealAck(false);
    setDeltas([null, null]);
  };

  if (!ready || state.phase === 'setup') {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="animate-pulse font-display text-xl uppercase tracking-widest text-gold-soft">
          Chargement…
        </p>
      </main>
    );
  }

  const lastEntry = state.history[state.history.length - 1] ?? null;
  const showVictory = state.phase === 'gameover' && revealAck;

  // Clé d'écran unique dérivée de la phase : garantit un seul enfant dans AnimatePresence.
  const screenKey:
    | 'betting'
    | 'roll-p1'
    | 'roll-p2'
    | 'reveal'
    | 'waiting' =
    state.phase === 'betting'
      ? 'betting'
      : state.phase === 'rolling-p1'
        ? 'roll-p1'
        : state.phase === 'rolling-p2'
          ? 'roll-p2'
          : (state.phase === 'reveal' || (state.phase === 'gameover' && !revealAck)) && lastEntry
            ? 'reveal'
            : 'waiting';

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col gap-6 px-4 py-6">
      {/* Barre d'état */}
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goHome}
          className="inline-flex h-11 items-center gap-1 rounded-xl border border-cream/20 bg-white/5 px-3 font-display text-sm uppercase tracking-wide text-cream hover:bg-white/10"
          aria-label="Retour à l'accueil"
        >
          ‹ Accueil
        </button>
        <div className="text-center font-display uppercase tracking-wide">
          <span className="text-gold-soft">Manche</span>{' '}
          <span className="text-cream">
            {state.round}/{state.maxRounds}
          </span>
          <span className="mx-2 text-cream/30">·</span>
          <span className="text-gold-soft">Pot</span>{' '}
          <span className="text-gold">{state.pot || state.carry || 0}</span>
        </div>
        <MuteButton />
      </header>

      {!showVictory ? (
        <div className="grid grid-cols-2 gap-3">
          <PlayerPanel
            player={state.players[0]}
            align="left"
            active={
              (state.phase === 'rolling-p1' || state.phase === 'betting') && state.turn === 0
            }
            delta={deltas[0]}
          />
          <PlayerPanel
            player={state.players[1]}
            align="right"
            active={state.phase === 'rolling-p2' && state.turn === 1}
            delta={deltas[1]}
          />
        </div>
      ) : null}

      <section className="flex flex-1 flex-col justify-center">
        {/* Un seul écran monté à la fois : le changement de `key` force le remontage
            et rejoue l'animation d'entrée. Pas d'AnimatePresence ici (fragile avec
            plusieurs branches conditionnelles). */}
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {screenKey === 'betting' ? (
            <div className="flex flex-col gap-5">
              {state.carry > 0 ? (
                <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-center text-sm text-gold-soft">
                  Cagnotte reportée : <strong>{state.carry} jetons</strong> s&apos;ajoutent au pot.
                </p>
              ) : null}
              <div className="card">
                <BetSlider min={bounds.min} max={bounds.max} value={bet} onChange={setBet} />
              </div>
              <button
                type="button"
                className="btn-gold w-full text-xl"
                disabled={bounds.max < bounds.min}
                onClick={() => dispatch({ type: 'PLACE_BET', amount: bet })}
              >
                Valider la mise · pot {bet * 2 + state.carry}
              </button>
              <HistoryLog history={state.history} />
            </div>
          ) : null}

          {screenKey === 'roll-p1' || screenKey === 'roll-p2' ? (
            <div className="flex flex-col items-center gap-8">
              <h2 className="text-center font-display text-3xl font-bold uppercase text-cream">
                Au tour de{' '}
                <span className="text-gold">
                  {screenKey === 'roll-p1' ? state.players[0].name : state.players[1].name}
                </span>
              </h2>
              <Dice values={null} rolling={rolling} label="2 dés" />
              <button
                type="button"
                className="btn-gold w-full max-w-xs text-2xl"
                disabled={rolling}
                onClick={() => doRoll(screenKey === 'roll-p1' ? 'p1' : 'p2')}
              >
                {rolling ? 'Ça roule…' : 'Lancer les dés'}
              </button>
            </div>
          ) : null}

          {screenKey === 'reveal' && lastEntry ? (
            <RoundResult
              entry={lastEntry}
              players={state.players}
              nextLabel={state.phase === 'gameover' ? 'Voir le récapitulatif' : 'Manche suivante'}
              onNext={() => {
                if (state.phase === 'gameover') setRevealAck(true);
                else dispatch({ type: 'NEXT_ROUND' });
              }}
            />
          ) : null}
        </motion.div>
      </section>

      {/* --- PASSAGE D'APPAREIL --- */}
      {state.phase === 'passing' ? (
        <PassScreen
          toName={state.players[1].name}
          onReady={() => dispatch({ type: 'CONFIRM_PASS' })}
        />
      ) : null}

      {/* --- VICTOIRE --- */}
      {showVictory ? (
        <div className="flex flex-1 flex-col justify-center py-6">
          <VictoryScreen state={state} onReplay={replay} onHome={goHome} />
        </div>
      ) : null}
    </main>
  );
}
