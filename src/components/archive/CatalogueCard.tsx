import { archiveIndex, pad2, recordFileCopy as copy, records, type Frequency, type MusicRecord } from "@/content/music";
import type { RecordFile } from "@/content/records";
import { SourcedValue } from "./SourcedValue";
import styles from "./CatalogueCard.module.css";

type Props = {
  record: MusicRecord;
  file: RecordFile;
  frequency: Frequency;
  className?: string;
};

/**
 * THE CATALOGUE CARD — the paper filed inside the case.
 *
 * Identity rows come from the index; documented rows are `Sourced` and
 * carry footnotes, or print PENDING — SOURCE REQUIRED. Always paper, on
 * every frequency: it's the one object that looks the same in every room.
 *
 * `data-vt="catalogue-card"` is the hook for the pull-out motion
 * (styles/view-transitions.css), played only when a file is opened.
 */
export function CatalogueCard({ record, file, frequency, className }: Props) {
  const slug = record.slug;
  const identity: [string, string][] = [
    ["Artist", record.artist],
    ["Album", record.album],
    ["Year", String(record.year)],
    ["Archive no.", record.catalogue],
    ["Frequency", `${frequency.code} — ${frequency.name}`],
  ];
  const documented = [
    ["Released", file.released],
    ["Origin", file.origin],
    ["Label", file.label],
    ["Format", file.format],
    ["Runtime", file.runtime],
  ] as const;

  return (
    <section className={[styles.card, className].filter(Boolean).join(" ")} data-vt="catalogue-card" aria-labelledby={`card-${slug}`}>
      <header className={styles.head}>
        <span className={styles.punch} aria-hidden="true" />
        <p className={styles.issuer}>Soft Club Archive — {archiveIndex.archive}</p>
        <h2 id={`card-${slug}`} className={styles.kind}>
          {copy.card}
        </h2>
        <p className={styles.number}>
          Card {pad2(record.number)} / {pad2(records.length)}
        </p>
      </header>

      <dl className={styles.fields}>
        {identity.map(([term, value]) => (
          <div key={term} className={styles.row}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className={styles.divider} aria-hidden="true" />
        {documented.map(([term, field]) => (
          <div key={term} className={styles.row} data-pending={field.status === "pending" || undefined}>
            <dt>{term}</dt>
            <dd>
              <SourcedValue field={field} slug={slug} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
