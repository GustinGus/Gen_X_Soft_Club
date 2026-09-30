/**
 * ARCHIVE DECK — state machine (Phase 2C).
 *
 *            INSERT            SEATED           RECOGNISED
 *   empty ─────────▶ inserting ───────▶ reading ──────────▶ ready
 *     ▲                  │                 │                  │
 *     │       OUT        │ EJECT           │ EJECT            │ EJECT
 *     └──── ejecting ◀───┴─────────────────┴──────────────────┘
 *
 * Five states, no more: "ejected" is the disc back in its case (= empty),
 * "loading" folds into reading (nothing is fetched), and playing / paused
 * don't exist while no audio is held — they join the union when a licensed
 * source does, without changing the ones below.
 *
 * Pure and synchronous: timing and motion live elsewhere. An event that
 * makes no sense in the current state is ignored, never an error.
 */

export type DeckState = "empty" | "inserting" | "reading" | "ready" | "ejecting";

export type DeckEvent =
  /** The user asks the deck to take the disc. */
  | { type: "INSERT" }
  /** The disc has reached its seat in the mechanism (the click). */
  | { type: "SEATED" }
  /** The record was identified from the archive's own data. */
  | { type: "RECOGNISED" }
  /** The user asks for the disc back — allowed at any point with media. */
  | { type: "EJECT" }
  /** The disc is back in its case. */
  | { type: "OUT" };

export const DECK_STATES: readonly DeckState[] = ["empty", "inserting", "reading", "ready", "ejecting"];

const transitions: Record<DeckState, Partial<Record<DeckEvent["type"], DeckState>>> = {
  empty: { INSERT: "inserting" },
  inserting: { SEATED: "reading", EJECT: "ejecting" },
  reading: { RECOGNISED: "ready", EJECT: "ejecting" },
  ready: { EJECT: "ejecting" },
  ejecting: { OUT: "empty" },
};

export function deckReducer(state: DeckState, event: DeckEvent): DeckState {
  return transitions[state][event.type] ?? state;
}

export const isDeckState = (value: unknown): value is DeckState =>
  typeof value === "string" && (DECK_STATES as readonly string[]).includes(value);

/** A disc is in (or partly in) the deck. */
export const hasMedia = (state: DeckState) => state !== "empty";

/** Which controls are live in each state. */
export const canInsert = (state: DeckState) => state === "empty";
export const canEject = (state: DeckState) => state === "inserting" || state === "reading" || state === "ready";
