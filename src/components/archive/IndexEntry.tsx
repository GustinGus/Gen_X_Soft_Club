import Link from "next/link";
import type { CSSProperties } from "react";
import { archiveIndex, pad2, type MusicRecord } from "@/content/music";
import { ArchiveSleeve } from "./ArchiveSleeve";
import styles from "./IndexEntry.module.css";

/**
 * One record in its drawer: the case + a museum label.
 *
 * The whole object is the hit area (a stretched link from the title), but
 * the link's name stays short: artist + album. Under the hand the case
 * rises out of the drawer — the first centimetre of pulling it out.
 */
export function IndexEntry({ record, index }: { record: MusicRecord; index: number }) {
  const titleId = `entry-${record.slug}`;

  return (
    <li className={styles.entry} data-hero={record.hero || undefined} style={{ "--i": index } as CSSProperties}>
      <article className={styles.object} aria-labelledby={titleId}>
        <ArchiveSleeve record={record} className={styles.sleeve} />
        <div className={styles.label}>
          <p className={styles.no} aria-hidden="true">
            {pad2(record.number)}
          </p>
          <h3 id={titleId} className={styles.title}>
            <Link
              className={styles.link}
              href={`/music/${record.slug}`}
              transitionTypes={["archive-open"]}
              data-cursor="open"
            >
              <span className={styles.artist}>{record.artist}</span>
              <span className="visually-hidden"> — </span>
              <span className={styles.album}>{record.album}</span>
            </Link>
          </h3>
          <dl className={styles.facts}>
            <div>
              <dt>Year</dt>
              <dd>{record.year}</dd>
            </div>
            <div>
              <dt>Archive no.</dt>
              <dd>{record.catalogue}</dd>
            </div>
          </dl>
          <p className={styles.open} aria-hidden="true">
            {archiveIndex.open} →
          </p>
        </div>
      </article>
    </li>
  );
}
