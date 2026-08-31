// Sons synthétisés via l'API Web Audio — aucun fichier binaire, 100% offline.

import { loadMuted, saveMuted } from './storage';

let ctx: AudioContext | null = null;
let muted = false;
let initialised = false;

function ensureInit(): void {
  if (initialised) return;
  initialised = true;
  muted = loadMuted();
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  ensureInit();
  return muted;
}

export function setMuted(value: boolean): void {
  ensureInit();
  muted = value;
  saveMuted(value);
}

export function toggleMuted(): boolean {
  setMuted(!isMuted());
  return muted;
}

function blip(
  audio: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gain = 0.12,
): void {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + start);
  g.gain.setValueAtTime(0.0001, audio.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

/** Bruit de dés qui roulent : rafale de clics filtrés. */
export function playRoll(): void {
  ensureInit();
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  const bufferSize = audio.sampleRate * 0.9;
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const t = i / bufferSize;
    const envelope = Math.sin(Math.PI * t) ** 2;
    data[i] = (Math.random() * 2 - 1) * envelope * (Math.random() > 0.82 ? 1 : 0.25);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;
  const g = audio.createGain();
  g.gain.value = 0.5;
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start();
}

export function playWin(): void {
  ensureInit();
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    blip(audio, f, i * 0.09, 0.28, 'triangle', 0.14);
  });
}

export function playTie(): void {
  ensureInit();
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  blip(audio, 330, 0, 0.18, 'sine', 0.1);
  blip(audio, 311, 0.14, 0.22, 'sine', 0.1);
}

export function playVictory(): void {
  ensureInit();
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
    blip(audio, f, i * 0.12, 0.4, 'triangle', 0.16);
  });
  blip(audio, 261.63, 0.1, 0.9, 'sine', 0.08);
}
