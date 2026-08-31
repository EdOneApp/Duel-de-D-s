'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Die as DieValue, Roll } from '@/lib/types';

const PIPS: Record<DieValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function randomFace(): DieValue {
  return ((Math.floor(Math.random() * 6) + 1) as DieValue);
}

function DieFace({ value, muted }: { value: DieValue; muted?: boolean }) {
  return (
    <div
      className="grid h-full w-full grid-cols-3 grid-rows-3 gap-[6%] p-[14%]"
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={
            'self-center justify-self-center rounded-full ' +
            (PIPS[value].includes(i)
              ? muted
                ? 'h-[68%] w-[68%] bg-table/40'
                : 'h-[68%] w-[68%] bg-table shadow-[inset_0_-2px_3px_rgba(0,0,0,0.35)]'
              : 'h-[68%] w-[68%] bg-transparent')
          }
        />
      ))}
    </div>
  );
}

function Die({
  value,
  rolling,
  delay,
  compact,
}: {
  value: DieValue | null;
  rolling: boolean;
  delay: number;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const [face, setFace] = useState<DieValue>(value ?? 1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rolling) {
      timer.current = setInterval(() => setFace(randomFace()), 90);
      return () => {
        if (timer.current) clearInterval(timer.current);
      };
    }
    if (timer.current) clearInterval(timer.current);
    if (value) setFace(value);
    return undefined;
  }, [rolling, value]);

  const spin = reduce
    ? { rotate: 0, scale: rolling ? [1, 1.06, 1] : 1 }
    : rolling
      ? { rotateX: [0, 360, 680, 900], rotateY: [0, 220, 480, 720], y: [0, -26, -8, 0] }
      : { rotateX: 0, rotateY: 0, y: 0 };

  return (
    <div className={'dice-scene ' + (compact ? 'h-16 w-16' : 'h-24 w-24 sm:h-28 sm:w-28')}>
      <motion.div
        className="dice-face relative h-full w-full rounded-2xl bg-cream shadow-die"
        animate={spin}
        transition={
          rolling
            ? { duration: reduce ? 0.4 : 1.1, ease: 'easeInOut', delay }
            : { type: 'spring', stiffness: 240, damping: 18, delay }
        }
      >
        <DieFace value={value === null && !rolling ? face : face} muted={value === null && !rolling} />
      </motion.div>
    </div>
  );
}

export default function Dice({
  values,
  rolling,
  label,
  compact,
}: {
  values: Roll | null;
  rolling: boolean;
  label?: string;
  compact?: boolean;
}) {
  const total = values ? values[0] + values[1] : null;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={compact ? 'flex items-center gap-3' : 'flex items-center gap-5'}
        role="img"
        aria-label={
          rolling
            ? 'Les dés roulent'
            : values
              ? `Dés : ${values[0]} et ${values[1]}, total ${total}`
              : 'Dés en attente'
        }
      >
        <Die value={values ? values[0] : null} rolling={rolling} delay={0} compact={compact} />
        <Die value={values ? values[1] : null} rolling={rolling} delay={0.06} compact={compact} />
      </div>
      {label ? (
        <p className="font-display text-sm uppercase tracking-widest text-gold-soft">{label}</p>
      ) : null}
      {!compact && !rolling && total !== null ? (
        <motion.p
          key={total}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-semibold text-cream"
        >
          Total&nbsp;: {total}
        </motion.p>
      ) : null}
    </div>
  );
}
