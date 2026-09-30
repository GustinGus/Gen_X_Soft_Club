import { pad2, type MusicRecord } from "@/content/music";
import type { RecordFile } from "@/content/records";
import type { DeckState } from "./deckMachine";
import styles from "./DeckDisplay.module.css";

type Props = {
  state: DeckState;
  record: MusicRecord;
  file: RecordFile;
  className?: string;
};

const pad3 = (n: number) => String(n).padStart(3, "0");

/**
 * THE LCD — a reflective STN panel: grey-green glass, dark segments, no
 * backlight. Everything it prints is either the machine's own state or
 * data the archive holds with a source. No play indicator, no running
 * clock: with no listening copy held, the counter reads --:--.
 *
 * `data-lcd` / `data-lcd-print` mark the segments the deck's sequence
 * drives (the READ flag, the cursor, READY's lines printing in).
 */
export function DeckDisplay({ state, record, file, className }: Props) {
  const media = state !== "empty";
  const tracks = file.tracklist.status === "sourced" ? file.tracklist.value.tracks : null;
  const first = tracks?.[0];
  const runtime = file.runtime.status === "sourced" ? file.runtime.value : null;

  return (
    <div className={[styles.lcd, className].filter(Boolean).join(" ")} role="group" aria-label="Deck display">
      <div className={styles.screen}>
        {/* Segment flags mirror the state printed below; unlit ones would read as lit to a screen reader. */}
        <p className={styles.flags} aria-hidden="true">
          <span data-on={media || undefined}>Disc</span>
          <span data-on={state === "reading" || undefined} data-lcd="read">
            Read
          </span>
          <span className={styles.flagFormat}>44.1k · 16-bit · Stereo</span>
        </p>

        {state === "empty" && (
          <>
            <p className={styles.main}>No media</p>
            <p className={styles.line}>Insert disc to read</p>
          </>
        )}

        {state === "inserting" && (
          <>
            <p className={styles.main}>Open</p>
            <p className={styles.line}>Media in slot</p>
          </>
        )}

        {state === "reading" && (
          <>
            <p className={styles.main}>
              Reading disc<span className={styles.cursor} data-lcd="cursor" aria-hidden="true">
                _
              </span>
            </p>
            <p className={styles.line}>Media detected</p>
          </>
        )}

        {state === "ready" && (
          <>
            <p className={styles.main} data-lcd-print="">Disc_{pad3(record.number)}</p>
            <p className={styles.line} data-lcd-print="">{record.artist}</p>
            <p className={styles.line} data-lcd-print="">
              {record.album} · {record.year}
            </p>
            <p className={styles.line} data-lcd-print="">
              {tracks ? `Tracks ${pad2(tracks.length)}` : "Tracklist pending"} ·{" "}
              {runtime ?? "Total pending"}
            </p>
            {first && (
              <p className={styles.line} data-lcd-print="">
                Track {pad2(first.position)} {first.title ?? "Untitled"}
              </p>
            )}
            <p className={styles.notice} data-lcd-print="">Audio not held</p>
          </>
        )}

        {state === "ejecting" && (
          <>
            <p className={styles.main}>Eject</p>
            <p className={styles.line}>Open</p>
          </>
        )}

        <p className={styles.counter}>
          <span className={styles.counterLabel}>{media ? "Disc" : "Time"}</span>
          <span className={styles.digits}>
            <span className={styles.ghost} aria-hidden="true">
              88:88
            </span>
            <span aria-hidden="true">--:--</span>
            <span className="visually-hidden">No playback time</span>
          </span>
        </p>
      </div>
    </div>
  );
}
