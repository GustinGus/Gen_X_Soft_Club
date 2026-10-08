import Link from "next/link";
import type { CSSProperties } from "react";
import {
  archiveIndex,
  coverOf,
  frequencyOf,
  neighboursOf,
  pad2,
  recordFileCopy as copy,
  records,
  type MusicRecord,
} from "@/content/music";
import type { RecordFile } from "@/content/records";
import { sleeveOf } from "@/content/sleeves";
import { ArchiveDeck } from "@/components/deck/ArchiveDeck";
import { ArchiveSleeve } from "./ArchiveSleeve";
import { CardStock } from "./CardStock";
import { CatalogueCard } from "./CatalogueCard";
import { ContextText } from "./ContextText";
import { Credits } from "./Credits";
import { FileTabs } from "./FileTabs";
import { PendingMark } from "./PendingMark";
import { SheetFocus } from "./SheetFocus";
import { sourceId } from "./SourcedValue";
import { Tracklist } from "./Tracklist";
import atmosphere from "./Atmosphere.module.css";
import styles from "./RecordSheet.module.css";

/**
 * THE RECORD FILE — one object out of its drawer, laid on the table.
 *
 *   case (shared element, carried over from the drawer)
 *   display title
 *   catalogue card (slides out from under the case on open)
 *   01 curatorial note · 02 context · 03 liner notes · 04 credits ·
 *   05 notes & sources
 *   file tabs (previous / next)
 *
 * Each file is lit by its frequency's room. Documented fields are sourced
 * or PENDING; the curatorial note is labelled as interpretation.
 */
export function RecordSheet({ record, file }: { record: MusicRecord; file: RecordFile }) {
  const frequency = frequencyOf(record.frequency);
  const { prev, next } = neighboursOf(record);
  const titleId = `record-title-${record.slug}`;
  const cover = coverOf(record);

  return (
    <article
      className={styles.sheet}
      data-frequency={frequency.id}
      data-tone={frequency.tone}
      data-theme={frequency.tone === "night" ? "night" : undefined}
      aria-labelledby={titleId}
    >
      <span className={atmosphere.atmosphere} data-atmosphere={frequency.id} aria-hidden="true" />

      <header className={styles.folio}>
        <Link className={styles.back} href={`/music#${frequency.id}`} transitionTypes={["archive-return"]}>
          <span aria-hidden="true">←</span> {copy.index}
        </Link>
        <p className={styles.fileCode}>
          {archiveIndex.archive} / {record.catalogue}
        </p>
        <p className={styles.muted}>
          {frequency.code} — {frequency.name}
        </p>
        <p className={styles.count}>
          File {pad2(record.number)} / {pad2(records.length)}
        </p>
      </header>

      <ArchiveSleeve record={record} variant="file" className={styles.sleeve} />
      {/* Shown while the disc is out of its case (deck has media). */}
      <p className={styles.inDeck} aria-hidden="true">
        Disc out — in deck SC-AU/02
      </p>

      <div className={styles.heading}>
        <h1 id={titleId} className={styles.title} tabIndex={-1}>
          <span className={styles.artist}>
            {file.titleLines.map((line, i) => (
              <span key={line} className={styles.line} style={{ "--i": i } as CSSProperties}>
                {line}{" "}
              </span>
            ))}
          </span>
          <span className="visually-hidden">— </span>
          <span className={styles.album}>{record.album}</span>
        </h1>

        <p className={styles.year}>
          <span className={styles.yearKey}>Year</span> {record.year}
        </p>
      </div>

      <CatalogueCard className={styles.card} record={record} file={file} frequency={frequency} />

      {/* The archive's audio unit, lying on the table under the card. New record, empty deck. */}
      <ArchiveDeck key={record.slug} className={styles.deck} record={record} file={file} />

      <section className={styles.section} aria-labelledby={`note-${record.slug}`}>
        <h2 id={`note-${record.slug}`} className={styles.sectionHead}>
          <span className={styles.sectionNo}>01</span> {copy.curatorialNote}
        </h2>
        <div className={styles.sectionBody}>
          <p className={styles.interpretation}>{copy.interpretation}</p>
          <p className={styles.noteText}>{file.curatorialNote}</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby={`context-${record.slug}`}>
        <h2 id={`context-${record.slug}`} className={styles.sectionHead}>
          <span className={styles.sectionNo}>02</span> {copy.context}
        </h2>
        <div className={styles.sectionBody}>
          <p className={styles.interpretation}>{copy.documented}</p>
          {file.context.status === "sourced" ? (
            <ContextText text={file.context.value} sources={file.context.sources} slug={record.slug} className={styles.contextText} />
          ) : (
            <PendingMark size="block" />
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby={`tracks-${record.slug}`}>
        <h2 id={`tracks-${record.slug}`} className={styles.sectionHead}>
          <span className={styles.sectionNo}>03</span> {copy.tracklist}
          <span className={styles.sectionAside}>{copy.linerNotes}</span>
        </h2>
        <div className={styles.sectionBody} data-wide>
          <Tracklist file={file} slug={record.slug} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby={`credits-${record.slug}`}>
        <h2 id={`credits-${record.slug}`} className={styles.sectionHead}>
          <span className={styles.sectionNo}>04</span> {copy.credits}
        </h2>
        <div className={styles.sectionBody}>
          <Credits file={file} slug={record.slug} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby={`sources-${record.slug}`}>
        <h2 id={`sources-${record.slug}`} className={styles.sectionHead}>
          <span className={styles.sectionNo}>05</span> {copy.notes}
        </h2>
        <div className={styles.sectionBody}>
          <ol className={styles.sources}>
            {file.sources.map((s, i) => (
              <li key={s.url} id={sourceId(record.slug, i)} className={styles.source}>
                <span className={styles.sourceNo}>{i + 1}</span>
                <span>
                  {s.publisher} — <cite>{s.title}</cite>.{" "}
                  <span className={styles.muted}>
                    {s.kind === "editorial-reference" ? "Editorial reference" : s.kind === "label" ? "Label" : "Official"}. Read{" "}
                    {s.accessed}.
                  </span>{" "}
                  <a className={styles.sourceLink} href={s.url} rel="noreferrer" target="_blank">
                    {s.url.replace(/^https:\/\//, "")}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </span>
              </li>
            ))}
          </ol>
          <ul className={styles.research}>
            <li>Values are taken from the listed sources only. Fields without a confirmable source stay pending.</li>
            {file.sources.every((s) => s.kind === "editorial-reference") && (
              <li>Official artist and label sources are still to be consulted for this file.</li>
            )}
            {file.researchNotes?.map((n) => <li key={n}>{n}</li>)}
            <li>
              {file.audio.availability === "not-held"
                ? "No listening copy is held: the archive hosts no recordings."
                : `Listening copy: ${file.audio.provider ?? "attached"}.`}
            </li>
            {cover?.status === "reference" ? (
              <li>
                {copy.artworkReferenceNote} Source: {cover.source.publisher}, {cover.edition}; retrieved {cover.retrieved}.
              </li>
            ) : (
              !cover && <li>{sleeveOf(record) ? copy.sleeveNote : copy.artworkNote}</li>
            )}
          </ul>
        </div>
      </section>

      <div className={styles.tabs}>
        <FileTabs prev={prev} next={next} />
      </div>

      <SheetFocus targetId={titleId} />
      <CardStock cardId={`card-${record.slug}`} />
    </article>
  );
}
