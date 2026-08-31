'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Confetti from './Confetti';
import { playVictory } from '@/lib/sound';
import type { GameState } from '@/lib/types';

export default function VictoryScreen({
  state,
  onReplay,
  onHome,
}: {
  state: GameState;
  onReplay: () => void;
  onHome: () => void;
}) {
  const { players, winner, isDraw, stats, round } = state;

  useEffect(() => {
    playVictory();
  }, []);

  const title = isDraw
    ? 'Match nul !'
    : `🎉 ${players[winner ?? 0].name} remporte la partie !`;

  const recap: { label: string; value: string }[] = [
    { label: 'Manches jouées', value: String(stats.roundsPlayed || round) },
    { label: 'Égalités', value: String(stats.ties) },
    {
      label: 'Plus gros gain',
      value: stats.biggestWin
        ? `${stats.biggestWin.amount} (${stats.biggestWin.name})`
        : '—',
    },
    {
      label: `Solde ${players[0].name}`,
      value: `${players[0].balance} jetons`,
    },
    {
      label: `Solde ${players[1].name}`,
      value: `${players[1].balance} jetons`,
    },
  ];

  return (
    <>
      <Confetti active={!isDraw} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-md flex-col items-center gap-7 text-center"
      >
        <motion.h1
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          className="font-display text-4xl font-bold uppercase text-gold sm:text-5xl"
        >
          {title}
        </motion.h1>

        <ul className="card w-full divide-y divide-cream/10">
          {recap.map((r) => (
            <li key={r.label} className="flex items-center justify-between py-2.5 text-left">
              <span className="font-display text-sm uppercase tracking-widest text-gold-soft">
                {r.label}
              </span>
              <span className="font-display text-lg text-cream">{r.value}</span>
            </li>
          ))}
        </ul>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-gold flex-1 text-xl" onClick={onReplay} autoFocus>
            Rejouer
          </button>
          <button type="button" className="btn-ghost flex-1 text-xl" onClick={onHome}>
            Accueil
          </button>
        </div>
      </motion.div>
    </>
  );
}
