import Link from "next/link";
import type { CSSProperties } from "react";
import { pad2, type MusicRecord } from "@/content/music";
import type { Dictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/href";
import type { Locale } from "@/i18n/locales";
import { ArchiveSleeve } from "./ArchiveSleeve";
import styles from "./IndexEntry.module.css";

/**
 * One record in its drawer: the case + a museum label.
 *
 * The whole object is the hit area (a stretched link from the title), but
 * the link's name stays short: artist + album. Under the hand the case
 * rises out of the drawer — the first centimetre of pulling it out.
 */
type Props = { record: MusicRecord; index: number; locale: Locale; copy: Dictionary };

export function IndexEntry({ record, index, locale, copy: dictionary }: Props) {
  const copy = dictionary.index;
  const titleId = `entry-${record.slug}`;

  return (
    <li className={styles.entry} data-hero={record.hero || undefined} style={{ "--i": index } as CSSProperties}>
      <article className={styles.object} aria-labelledby={titleId}>
        <ArchiveSleeve record={record} className={styles.sleeve} copy={dictionary.sleeve} />
        <div className={styles.label}>
          <p className={styles.no} aria-hidden="true">
            {pad2(record.number)}
          </p>
          <h3 id={titleId} className={styles.title}>
            <Link
              className={styles.link}
              href={href(locale, `/music/${record.slug}`)}
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
              <dt>{copy.year}</dt>
              <dd>{record.year}</dd>
            </div>
            <div>
              <dt>{copy.archiveNo}</dt>
              <dd>{record.catalogue}</dd>
            </div>
          </dl>
          <p className={styles.open} aria-hidden="true">
            {copy.open} →
          </p>
        </div>
      </article>
    </li>
  );
}
