"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Persistent sound context — PHASE 1: architecture only.
 *
 * Mounted in the root layout so a future player survives route changes
 * (built later with the music-experience skill). No audio is loaded,
 * nothing autoplays, and no recordings are hosted.
 */
export type SoundState = {
  /** Whether a playback engine exists yet. */
  available: boolean;
  muted: boolean;
  /** Future: currently loaded track metadata. */
  track: null;
};

const SoundContext = createContext<SoundState>({ available: false, muted: true, track: null });

export function SoundProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SoundState>(() => ({ available: false, muted: true, track: null }), []);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useSound = () => useContext(SoundContext);
