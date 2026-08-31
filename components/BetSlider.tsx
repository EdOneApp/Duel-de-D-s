'use client';

import { useEffect, useState } from 'react';

export default function BetSlider({
  min,
  max,
  value,
  onChange,
  disabled,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v || 0)));

  const commit = (v: number) => {
    const c = clamp(v);
    setLocal(c);
    onChange(c);
  };

  const quick: { label: string; value: number }[] = [
    { label: 'Min', value: min },
    { label: '¼', value: clamp(min + (max - min) * 0.25) },
    { label: '½', value: clamp(min + (max - min) * 0.5) },
    { label: 'Max', value: max },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <label htmlFor="bet" className="field-label mb-0">
          Mise commune
        </label>
        <div className="font-display text-3xl font-semibold text-gold">
          {local} <span className="text-base text-gold-soft">jetons</span>
        </div>
      </div>

      <input
        id="bet"
        type="range"
        min={min}
        max={max}
        step={1}
        value={local}
        disabled={disabled || max <= min}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-black/40 accent-gold
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        aria-valuetext={`${local} jetons`}
      />

      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            disabled={disabled}
            onClick={() => commit(q.value)}
            className={
              'min-h-[44px] flex-1 rounded-xl border px-3 py-2 font-display text-sm uppercase tracking-wide transition ' +
              (local === q.value
                ? 'border-gold bg-gold/20 text-gold'
                : 'border-cream/20 bg-white/5 text-cream hover:bg-white/10')
            }
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => commit(local - 5)}
          className="btn-ghost !min-h-[44px] !px-4 !text-xl"
          aria-label="Diminuer la mise de 5"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={local}
          disabled={disabled}
          onChange={(e) => setLocal(Number(e.target.value))}
          onBlur={(e) => commit(Number(e.target.value))}
          className="text-input text-center"
          aria-label="Montant de la mise"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => commit(local + 5)}
          className="btn-ghost !min-h-[44px] !px-4 !text-xl"
          aria-label="Augmenter la mise de 5"
        >
          +
        </button>
      </div>

      <p className="text-sm text-cream/60">
        Entre {min} et {max} jetons (plafonné au solde du joueur le plus pauvre).
      </p>
    </div>
  );
}
