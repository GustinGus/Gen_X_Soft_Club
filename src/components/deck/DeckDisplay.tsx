import { pad2, type MusicRecord } from "@/content/music";
import type { RecordFile } from "@/content/records";
import type { DeckState } from "./deckMachine";
import styles from "./DeckDisplay.module.css";

type Props = {
  state: DeckState;
  record: MusicRecord;
  file: RecordFile;
  /** The display's accessible name, in the page's language. */
  label: string;
  /** What the counter says to a screen reader, in the page's language. */
  noPlaybackTime: string;
  /** The language of the panel's own lettering, where the page is in another. */
  lettering?: string;
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
export function DeckDisplay({ state, record, file, label, noPlaybackTime, lettering, className }: Props) {
  const media = state !== "empty";
  const tracks = file.tracklist.status === "sourced" ? file.tracklist.value.tracks : null;
  const first = tracks?.[0];
  const runtime = file.runtime.status === "sourced" ? file.runtime.value : null;

  return (
    <div className={[styles.lcd, className].filter(Boolean).join(" ")} role="group" aria-label={label}>
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
            <p className={styles.main} lang={lettering}>No media</p>
            <p className={styles.line} lang={lettering}>Insert disc to read</p>
          </>
        )}

        {state === "inserting" && (
          <>
            <p className={styles.main} lang={lettering}>Open</p>
            <p className={styles.line} lang={lettering}>Media in slot</p>
          </>
        )}

        {state === "reading" && (
          <>
            <p className={styles.main} lang={lettering}>
              Reading disc<span className={styles.cursor} data-lcd="cursor" aria-hidden="true">
                _
              </span>
            </p>
            <p className={styles.line} lang={lettering}>Media detected</p>
          </>
        )}

        {state === "ready" && (
          <>
            <p className={styles.main} data-lcd-print="" lang={lettering}>Disc_{pad3(record.number)}</p>
            <p className={styles.line} data-lcd-print="">{record.artist}</p>
            <p className={styles.line} data-lcd-print="">
              {record.album} · {record.year}
            </p>
            <p className={styles.line} data-lcd-print="" lang={lettering}>
              {tracks ? `Tracks ${pad2(tracks.length)}` : "Tracklist pending"} ·{" "}
              {runtime ?? "Total pending"}
            </p>
            {first && (
              <p className={styles.line} data-lcd-print="">
                {lettering ? (
                  // the panel's own words are English; a track's title is in whatever language it is in
                  <>
                    <span lang={lettering}>Track {pad2(first.position)}</span>{" "}
                    {first.title ?? <span lang={lettering}>Untitled</span>}
                  </>
                ) : (
                  <>
                    Track {pad2(first.position)} {first.title ?? "Untitled"}
                  </>
                )}
              </p>
            )}
            <p className={styles.notice} data-lcd-print="" lang={lettering}>Audio not held</p>
          </>
        )}

        {state === "ejecting" && (
          <>
            <p className={styles.main} lang={lettering}>Eject</p>
            <p className={styles.line} lang={lettering}>Open</p>
          </>
        )}

        <p className={styles.counter}>
          <span className={styles.counterLabel} lang={lettering}>{media ? "Disc" : "Time"}</span>
          <span className={styles.digits}>
            <span className={styles.ghost} aria-hidden="true">
              88:88
            </span>
            <span aria-hidden="true">--:--</span>
            <span className="visually-hidden">{noPlaybackTime}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
