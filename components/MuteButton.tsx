'use client';

import { useEffect, useState } from 'react';
import { isMuted, toggleMuted } from '@/lib/sound';

export default function MuteButton() {
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMuted(isMuted());
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setMuted(toggleMuted())}
      aria-pressed={muted}
      aria-label={muted ? 'Activer le son' : 'Couper le son'}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cream/20 bg-white/5 text-lg text-cream transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
