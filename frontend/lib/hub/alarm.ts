/**
 * The Admin panel's alarm: a police-style siren made in the browser with
 * the Web Audio API (no sound file to download).
 *
 * Browsers only let a page make sound after the person has clicked or typed
 * on it. primeAlarm() is called from the Unlock button, which counts, and
 * keeps the audio context it opens; the alarm then plays on that context
 * later, when the panel locks itself or the third wrong password lands. If
 * the browser still refuses (a fresh page load, a blocked site), the lights
 * show without sound.
 *
 * The siren wails between 600 and 1400 Hz once a second, in step with the
 * lights, at a moderate volume, and stops after MAX_MS on its own.
 */
import { useSyncExternalStore } from "react";

const MAX_MS = 30_000;
const VOLUME = 0.18;

type Siren = { stop: () => void };

let ctx: AudioContext | null = null;
let siren: Siren | null = null;
let autoStop: number | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function audioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

/** Open (or wake) the audio context. Call it from a click or key press. */
export function primeAlarm() {
  const Ctx = audioContextClass();
  if (!Ctx) return;
  try {
    ctx ??= new Ctx();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  } catch {
    ctx = null;
  }
}

export function isAlarmSounding(): boolean {
  return siren !== null;
}

/** Start the siren. Safe to call when it is already sounding or sound is blocked. */
export function startAlarm(durationMs = MAX_MS) {
  if (siren) return;
  primeAlarm();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const tone = ctx.createOscillator();
    tone.type = "sawtooth";
    tone.frequency.value = 1000;

    // The wail: a slow wave pushing the pitch 400 Hz either side of 1000 Hz.
    const wail = ctx.createOscillator();
    wail.type = "triangle";
    wail.frequency.value = 1;
    const depth = ctx.createGain();
    depth.gain.value = 400;
    wail.connect(depth).connect(tone.frequency);

    // Take the harsh edge off the sawtooth.
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 2800;

    const volume = ctx.createGain();
    volume.gain.setValueAtTime(0, now);
    volume.gain.linearRampToValueAtTime(VOLUME, now + 0.15);

    tone.connect(soften).connect(volume).connect(ctx.destination);
    tone.start(now);
    wail.start(now);

    const audio = ctx;
    siren = {
      stop: () => {
        const t = audio.currentTime;
        volume.gain.cancelScheduledValues(t);
        volume.gain.setValueAtTime(volume.gain.value, t);
        volume.gain.linearRampToValueAtTime(0, t + 0.12);
        tone.stop(t + 0.15);
        wail.stop(t + 0.15);
      },
    };
    window.clearTimeout(autoStop);
    autoStop = window.setTimeout(stopAlarm, durationMs);
    emit();
  } catch {
    siren = null;
  }
}

export function stopAlarm() {
  if (typeof window !== "undefined") window.clearTimeout(autoStop);
  if (!siren) return;
  siren.stop();
  siren = null;
  emit();
}

export function useAlarmSounding(): boolean {
  return useSyncExternalStore(subscribe, isAlarmSounding, () => false);
}
