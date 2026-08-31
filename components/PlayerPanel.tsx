'use client';

import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import type { Player } from '@/lib/types';

export default function PlayerPanel({
  player,
  active,
  align = 'left',
  delta,
}: {
  player: Player;
  active?: boolean;
  align?: 'left' | 'right';
  /** Variation de solde à signaler (+/-). */
  delta?: number | null;
}) {
  return (
    <motion.div
      layout
      className={
        'card flex flex-col gap-1 ' +
        (align === 'right' ? 'items-end text-right ' : 'items-start text-left ') +
        (active ? 'ring-2 ring-gold animate-pulse-gold' : 'ring-1 ring-transparent')
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            'inline-block h-2.5 w-2.5 rounded-full ' + (active ? 'bg-gold' : 'bg-cream/30')
          }
          aria-hidden="true"
        />
        <span className="font-display text-lg uppercase tracking-wide text-cream">
          {player.name}
        </span>
      </div>

      <div>
        <AnimatedNumber
          value={player.balance}
          className="font-display text-4xl font-bold text-gold sm:text-5xl"
        />
        <span className="ml-1 font-display text-sm text-gold-soft">jetons</span>
      </div>

      <div className="min-h-[1.25rem]">
        {delta != null && delta !== 0 ? (
          <motion.span
            key={`${player.name}-${delta}-${player.balance}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={
              'font-display text-base font-semibold ' +
              (delta > 0 ? 'text-emerald-300' : 'text-rose-300')
            }
          >
            {delta > 0 ? `+${delta}` : delta} cette manche
          </motion.span>
        ) : active ? (
          <span className="font-display text-xs uppercase tracking-widest text-gold-soft">
            À votre tour
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
