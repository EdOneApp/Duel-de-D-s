'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DEFAULTS } from '@/lib/gameReducer';
import { loadGame, savePendingSetup } from '@/lib/storage';

const ROUND_OPTIONS = [5, 10, 15, 20];

export default function HomePage() {
  const router = useRouter();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [doubleSix, setDoubleSix] = useState(false);
  const [doubleOne, setDoubleOne] = useState(false);
  const [maxRounds, setMaxRounds] = useState<number>(DEFAULTS.maxRounds);
  const [startingBalance, setStartingBalance] = useState<number>(DEFAULTS.startingBalance);
  const [showRules, setShowRules] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saved = loadGame();
    setHasSaved(!!saved && saved.phase !== 'setup' && saved.phase !== 'gameover');
  }, []);

  const start = () => {
    savePendingSetup({
      p1: p1.trim() || 'Joueur 1',
      p2: p2.trim() || 'Joueur 2',
      bonus: { doubleSix, doubleOne },
      maxRounds,
      startingBalance,
    });
    router.push('/game');
  };

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center gap-8 px-5 py-10">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-display text-sm uppercase tracking-[0.4em] text-gold-soft">
          Pass &amp; play · 2 joueurs
        </p>
        <h1 className="mt-2 font-display text-6xl font-bold uppercase leading-none text-cream sm:text-7xl">
          Duel de <span className="text-gold">Dés</span>
        </h1>
        <p className="mt-3 text-cream/70">
          Misez, lancez, comparez. Le plus haut total rafle le pot.
        </p>
      </motion.header>

      {hasSaved ? (
        <button
          type="button"
          onClick={() => router.push('/game')}
          className="btn-ghost w-full text-lg"
        >
          ↩︎ Reprendre la partie en cours
        </button>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card flex flex-col gap-5"
      >
        <div>
          <label htmlFor="p1" className="field-label">
            Nom du joueur 1
          </label>
          <input
            id="p1"
            className="text-input"
            placeholder="Joueur 1"
            maxLength={16}
            value={p1}
            onChange={(e) => setP1(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="p2" className="field-label">
            Nom du joueur 2
          </label>
          <input
            id="p2"
            className="text-input"
            placeholder="Joueur 2"
            maxLength={16}
            value={p2}
            onChange={(e) => setP2(e.target.value)}
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="field-label">Options</legend>

          <div>
            <span className="mb-1 block text-sm text-cream/70">Nombre de manches</span>
            <div className="flex gap-2">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxRounds(n)}
                  className={
                    'min-h-[44px] flex-1 rounded-xl border font-display text-lg transition ' +
                    (maxRounds === n
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-cream/20 bg-white/5 text-cream hover:bg-white/10')
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm text-cream/70">Jetons de départ</span>
            <div className="flex gap-2">
              {[200, 500, 1000].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStartingBalance(n)}
                  className={
                    'min-h-[44px] flex-1 rounded-xl border font-display text-lg transition ' +
                    (startingBalance === n
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-cream/20 bg-white/5 text-cream hover:bg-white/10')
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-cream/15 bg-white/5 px-4">
            <input
              type="checkbox"
              className="h-5 w-5 accent-gold"
              checked={doubleSix}
              onChange={(e) => setDoubleSix(e.target.checked)}
            />
            <span className="text-cream">
              <strong className="font-display">Double 6</strong> — gain auto + 50 % du pot
            </span>
          </label>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-cream/15 bg-white/5 px-4">
            <input
              type="checkbox"
              className="h-5 w-5 accent-gold"
              checked={doubleOne}
              onChange={(e) => setDoubleOne(e.target.checked)}
            />
            <span className="text-cream">
              <strong className="font-display">Double 1</strong> — perte automatique du round
            </span>
          </label>
        </fieldset>

        <button type="button" className="btn-gold w-full text-2xl" onClick={start}>
          Commencer
        </button>
      </motion.section>

      <section className="card">
        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          aria-expanded={showRules}
          className="flex min-h-[44px] w-full items-center justify-between font-display text-sm uppercase tracking-widest text-gold-soft"
        >
          Règles du jeu
          <span aria-hidden="true">{showRules ? '▲' : '▼'}</span>
        </button>
        {showRules ? (
          <div className="mt-3 space-y-2 text-sm text-cream/80">
            <p>• Chaque joueur démarre avec le même nombre de jetons.</p>
            <p>• Avant chaque manche, on fixe une mise commune (plafonnée au solde le plus faible).</p>
            <p>
              • Chaque joueur lance 2 dés à son tour, l&apos;appareil passe de main en main. La somme
              la plus haute remporte le pot (2× la mise).
            </p>
            <p>
              • Égalité : la mise reste engagée et grossit la cagnotte de la manche suivante.
            </p>
            <p>
              • Fin de partie : un joueur à 0 jeton, ou la limite de manches atteinte — le plus haut
              solde l&apos;emporte.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
