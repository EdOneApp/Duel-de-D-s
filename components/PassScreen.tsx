'use client';

import { motion } from 'framer-motion';

export default function PassScreen({
  toName,
  onReady,
}: {
  toName: string;
  onReady: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-table-dark p-6 text-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Passez l'appareil à ${toName}`}
    >
      <motion.div
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-3"
      >
        <span className="font-display text-sm uppercase tracking-[0.3em] text-gold-soft">
          Pass &amp; play
        </span>
        <h2 className="font-display text-4xl font-bold uppercase text-cream sm:text-5xl">
          Passez l&apos;appareil à
        </h2>
        <p className="font-display text-5xl font-bold text-gold sm:text-6xl">{toName}</p>
      </motion.div>

      <p className="max-w-sm text-cream/70">
        Ne regardez pas l&apos;écran avant votre tour. Quand {toName} est prêt·e, touchez le bouton.
      </p>

      <button type="button" className="btn-gold w-full max-w-xs text-xl" onClick={onReady}>
        Je suis {toName}, prêt·e
      </button>
    </motion.div>
  );
}
