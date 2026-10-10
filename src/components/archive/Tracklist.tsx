import { pad2 } from "@/content/music";
import type { RecordFile } from "@/content/records";
import type { Dictionary } from "@/i18n/dictionary";
import { fill } from "@/i18n/format";
import { PendingMark } from "./PendingMark";
import { sourceId } from "./SourcedValue";
import styles from "./Tracklist.module.css";

/**
 * LINER NOTES — the tracklist set like the back of a booklet: position,
 * title, dotted leader, length. Titles and lengths exactly as sourced; the
 * edition the listing describes is always printed above it.
 */
export function Tracklist({ file, slug, copy }: { file: RecordFile; slug: string; copy: Dictionary["record"] }) {
  const { tracklist } = file;
  if (tracklist.status === "pending") return <PendingMark size="block" copy={copy} />;

  const { edition, tracks } = tracklist.value;

  return (
    <div className={styles.liner}>
      <p className={styles.edition}>
        {edition} <span aria-hidden="true">·</span> {pad2(tracks.length)}
        {` ${copy.tracks}`}
        {tracklist.sources.map((i) => (
          <a key={i} className={styles.ref} href={`#${sourceId(slug, i)}`} aria-label={fill(copy.source, { n: i + 1 })}>
            {i + 1}
          </a>
        ))}
      </p>
      <ol className={styles.tracks}>
        {tracks.map((t) => (
          <li key={t.position} className={styles.track}>
            <span className={styles.position} aria-hidden="true">
              {pad2(t.position)}
            </span>
            <span className={styles.title}>
              {t.title ?? <span className={styles.untitled}>{copy.untitled}</span>}
              {t.note && <span className={styles.note}>{t.note}</span>}
            </span>
            <span className={styles.leader} aria-hidden="true" />
            <span className={styles.duration}>
              <span className="visually-hidden">{`${copy.length} `}</span>
              {t.duration}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
