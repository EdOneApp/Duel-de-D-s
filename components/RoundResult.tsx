'use client';

import { motion } from 'framer-motion';
import Dice from './Dice';
import type { GameState, HistoryEntry } from '@/lib/types';

export default function RoundResult({
  entry,
  players,
  onNext,
  nextLabel = 'Manche suivante',
}: {
  entry: HistoryEntry;
  players: GameState['players'];
  onNext: () => void;
  nextLabel?: string;
}) {
  const headline =
    entry.winner === 'tie' ? 'Égalité !' : `${entry.winnerName} remporte la manche`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <motion.h2
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="text-center font-display text-3xl font-bold uppercase text-gold sm:text-4xl"
      >
        {headline}
      </motion.h2>

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <div className="card flex flex-col items-center gap-3 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-gold-soft">
            {players[0].name}
          </p>
          <Dice values={entry.p1} rolling={false} compact />
          <p className="font-display text-xl font-semibold text-cream">
            Total&nbsp;: {entry.p1[0] + entry.p1[1]}
          </p>
        </div>
        <div className="card flex flex-col items-center gap-3 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-gold-soft">
            {players[1].name}
          </p>
          <Dice values={entry.p2} rolling={false} compact />
          <p className="font-display text-xl font-semibold text-cream">
            Total&nbsp;: {entry.p2[0] + entry.p2[1]}
          </p>
        </div>
      </div>

      {entry.note ? (
        <p className="rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-center font-display text-sm uppercase tracking-wide text-gold-soft">
          {entry.note}
        </p>
      ) : null}

      <p className="text-center text-lg text-cream/80">
        {entry.winner === 'tie'
          ? 'La mise reste engagée et grossit la cagnotte de la manche suivante.'
          : `Pot remporté : ${entry.amount} jetons.`}
      </p>

      <button type="button" className="btn-gold w-full max-w-xs text-xl" onClick={onNext} autoFocus>
        {nextLabel}
      </button>
    </motion.div>
  );
}
