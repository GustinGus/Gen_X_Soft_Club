/**
 * AUDIO — types only (Phase 2C).
 *
 * The archive hosts no recordings. These types describe what a record may
 * one day carry, so the Archive Deck can grow transport controls without
 * being rebuilt. Until a source is licensed, every record is "not-held".
 */

import type { Sourced } from "@/content/records";

/** What the archive can offer for a record. */
export type AudioAvailability =
  /** No listening copy exists in the archive (every record today). */
  | "not-held"
  /** A full licensed source is attached. */
  | "licensed"
  /** Only a licensed excerpt is attached. */
  | "preview-only"
  /** A source is attached but cannot be played here (region, rights, outage). */
  | "unavailable";

/** Where sound would come from. Never a scraped or unofficial link. */
export type AudioSource =
  /** A licensed file hosted by the archive. */
  | { kind: "file"; url: string; mime: string }
  /** An official player from a rights holder / provider. */
  | { kind: "embed"; provider: string; embedId: string };

export type AudioRights = {
  licence: string;
  holder: string;
  /** ISO date the rights were checked. */
  verified: string;
};

export type RecordAudio = {
  availability: AudioAvailability;
  source?: AudioSource;
  preview?: AudioSource;
  duration?: Sourced<string>;
  provider?: string;
  rights?: AudioRights;
};

/** True when the deck may offer transport controls. */
export const canPlay = (audio: RecordAudio) =>
  (audio.availability === "licensed" || audio.availability === "preview-only") && !!(audio.source ?? audio.preview);

/** States a future playback engine reports. */
export type EngineState = "idle" | "loading" | "ready" | "playing" | "paused" | "error";

/**
 * The single owner of sound (lives in SoundProvider, above every route).
 * No implementation ships in 2C: a file engine (HTMLAudioElement) or an
 * official embed adapter plugs in here later, without touching the deck.
 */
export interface AudioEngine {
  readonly state: EngineState;
  load(source: AudioSource): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  subscribe(listener: (state: EngineState) => void): () => void;
  dispose(): void;
}
