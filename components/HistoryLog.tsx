'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { HistoryEntry } from '@/lib/types';

function rollText(r: [number, number]): string {
  return `${r[0]}+${r[1]}=${r[0] + r[1]}`;
}

export default function HistoryLog({ history }: { history: HistoryEntry[] }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="card p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-between px-5 py-3 font-display text-sm uppercase tracking-widest text-gold-soft"
      >
        Historique des manches ({history.length})
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {[...history].reverse().map((h) => (
              <li
                key={h.round}
                className="flex items-center justify-between gap-3 border-t border-cream/10 px-5 py-2.5 text-sm"
              >
                <span className="font-display text-gold-soft">M{h.round}</span>
                <span className="text-cream/70">
                  {rollText(h.p1)} · {rollText(h.p2)}
                </span>
                <span className="text-right">
                  {h.winner === 'tie' ? (
                    <span className="text-cream/60">Égalité</span>
                  ) : (
                    <span className="text-emerald-300">
                      {h.winnerName} +{h.amount}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
