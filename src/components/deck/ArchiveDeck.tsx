"use client";

import { useReducer, useRef, useState, useSyncExternalStore } from "react";
import type { MusicRecord } from "@/content/music";
import type { RecordFile } from "@/content/records";
import { DeckControls } from "./DeckControls";
import { DeckDiscPoster } from "./DeckDiscPoster";
import { DeckDisplay } from "./DeckDisplay";
import { useReducedMotion } from "@/motion/useMediaQuery";
import { deckReducer, hasMedia, isDeckState, type DeckState } from "./deckMachine";
import { useDeckSequence } from "./useDeckSequence";
import styles from "./ArchiveDeck.module.css";

type Props = {
  record: MusicRecord;
  file: RecordFile;
  className?: string;
};

/**
 * Inspection only (dev builds): `?deck=reading` forces a state so every
 * configuration of the machine can be reviewed without motion. The keys
 * are inert while it is forced. Production always starts EMPTY and
 * ignores the parameter.
 */
const INSPECT = process.env.NODE_ENV !== "production";
const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const readForced = (): DeckState | null => {
  if (!INSPECT) return null;
  const value = new URLSearchParams(window.location.search).get("deck");
  return isDeckState(value) ? value : null;
};

/**
 * THE ARCHIVE DECK — SC-AU/02, the archive's own audio unit.
 *
 * Seen from above, lying on the table under the catalogue card: a matte
 * aluminium plate with the media slot along its top edge, a smoked
 * polycarbonate window over the disc chamber, a reflective LCD and two
 * keys. The disc is the record's own — the same Ø120 mm object as in the
 * case — and is only ever partly visible: under the plate, through the
 * window, or standing out of the slot.
 *
 * The keys drive the machine; `useDeckSequence` moves the disc and the
 * card and reports what only the motion knows (seated, recognised, out).
 * The file's layout reads `data-deck` on the article (card at rest over
 * the deck, or set aside).
 */
export function ArchiveDeck({ record, file, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [machine, dispatch] = useReducer(deckReducer, "empty");
  const forced = useSyncExternalStore(subscribe, readForced, () => null);
  const state = forced ?? machine;
  const reduced = useReducedMotion();
  const send = useDeckSequence({ deck: ref, state, dispatch, reduced, still: forced !== null });

  // Announce only what the user set going — never the state at first paint.
  const [touched, setTouched] = useState(false);
  const insert = () => {
    setTouched(true);
    send({ type: "INSERT" });
  };
  const eject = () => {
    setTouched(true);
    send({ type: "EJECT" });
  };

  const announcement: Record<DeckState, string> = {
    empty: "Disc returned to its case.",
    inserting: "Disc inserting.",
    reading: "Reading disc.",
    ready: `Disc ready: ${record.artist}, ${record.album}, ${record.year}. No listening copy is held.`,
    ejecting: "Ejecting disc.",
  };

  return (
    <section
      ref={ref}
      className={[styles.deck, className].filter(Boolean).join(" ")}
      data-state={state}
      aria-label="Archive deck SC-AU/02"
    >
      <div className={styles.plate}>
        {/* The part of the disc standing out of the slot, above the plate's edge. */}
        <div className={styles.protrude} aria-hidden="true">
          {(state === "inserting" || state === "ejecting") && (
            <DeckDiscPoster catalogue={record.catalogue} part="slot" className={styles.disc} />
          )}
        </div>

        <span className={styles.slot} aria-hidden="true" />
        <p className={styles.slotLegend} aria-hidden="true">
          <span>▾</span> Media slot — Ø 120 mm
        </p>

        {/* Smoked polycarbonate over the chamber: the disc, seen from above. */}
        <div className={styles.window} aria-hidden="true">
          <span className={styles.hub} />
          <span className={styles.sled} />
          {hasMedia(state) && <DeckDiscPoster catalogue={record.catalogue} part="window" className={styles.disc} />}
          <span className={styles.smoke} />
        </div>

        <header className={styles.brand}>
          <p className={styles.maker}>Gen X Soft Club</p>
          <p className={styles.model}>Archive Audio Unit</p>
          <p className={styles.code}>SC-AU/02</p>
        </header>

        <DeckDisplay className={styles.lcd} state={state} record={record} file={file} />
        <DeckControls
          className={styles.controls}
          state={state}
          onInsert={forced ? undefined : insert}
          onEject={forced ? undefined : eject}
        />

        <footer className={styles.foot} aria-hidden="true">
          <span className={styles.grille} />
          <span>ARCHIVE_002 · 1994—2003 · CD-DA</span>
        </footer>

        <span className={styles.screw} data-corner="tl" aria-hidden="true" />
        <span className={styles.screw} data-corner="tr" aria-hidden="true" />
        <span className={styles.screw} data-corner="bl" aria-hidden="true" />
        <span className={styles.screw} data-corner="br" aria-hidden="true" />
      </div>

      <p className="visually-hidden" aria-live="polite">
        {touched ? announcement[state] : ""}
      </p>
    </section>
  );
}
