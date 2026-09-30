import { pad2 } from "@/content/music";
import type { RecordFile } from "@/content/records";
import { PendingMark } from "./PendingMark";
import { sourceId } from "./SourcedValue";
import styles from "./Tracklist.module.css";

/**
 * LINER NOTES — the tracklist set like the back of a booklet: position,
 * title, dotted leader, length. Titles and lengths exactly as sourced; the
 * edition the listing describes is always printed above it.
 */
export function Tracklist({ file, slug }: { file: RecordFile; slug: string }) {
  const { tracklist } = file;
  if (tracklist.status === "pending") return <PendingMark size="block" />;

  const { edition, tracks } = tracklist.value;

  return (
    <div className={styles.liner}>
      <p className={styles.edition}>
        {edition} <span aria-hidden="true">·</span> {pad2(tracks.length)} tracks
        {tracklist.sources.map((i) => (
          <a key={i} className={styles.ref} href={`#${sourceId(slug, i)}`} aria-label={`Source ${i + 1}`}>
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
              {t.title ?? <span className={styles.untitled}>Untitled in source listing</span>}
              {t.note && <span className={styles.note}>{t.note}</span>}
            </span>
            <span className={styles.leader} aria-hidden="true" />
            <span className={styles.duration}>
              <span className="visually-hidden">Length </span>
              {t.duration}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
