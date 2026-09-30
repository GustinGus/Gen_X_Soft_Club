"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { ArchiveSleeve } from "@/components/archive/ArchiveSleeve";
import { PhotoPlate } from "@/components/editorial/Placeholders";
import { afterHours as copy, frequencies, pad2, recordsIn, spanOf } from "@/content/music";
import { useReveal } from "@/motion/useReveal";
import styles from "./AfterHours.module.css";

const frequency = frequencies.find((f) => f.id === "after-hours")!;

/**
 * 01 / AFTER HOURS — the first real listening file.
 *
 * Records are archive objects (case + museum-style label), not cards.
 * Each opens its file (/music/[slug]); the case is the shared element.
 * Identity data comes from content/music.ts; the year span is derived from
 * the records themselves. The curatorial note is labelled as interpretation.
 */
export function AfterHours() {
  const ref = useRef<HTMLElement>(null);
  const recordsRef = useRef<HTMLOListElement>(null);
  useReveal(ref, 0.1);
  useReveal(recordsRef, 0.2);
  const filed = recordsIn("after-hours");

  return (
    <section
      ref={ref}
      id="after-hours"
      className={styles.afterHours}
      aria-labelledby="after-hours-code after-hours-title"
      data-theme="night"
    >
      <header className={styles.folio}>
        <p className={styles.fileCode} id="after-hours-code">
          {frequency.code} / {frequency.name}
        </p>
        <p className={styles.muted}>{copy.file}</p>
        <p className={styles.where}>
          {copy.place} <span aria-hidden="true">—</span> {spanOf("after-hours")}
        </p>
        <ul className={styles.scene} aria-label="Scene descriptors">
          {copy.scene.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </header>

      <h2 id="after-hours-title" className={styles.title}>
        {copy.titleLines.map((line, i) => (
          <span key={line} className={styles.line} data-line={i}>
            <span className={styles.lineInner} style={{ "--i": i } as CSSProperties}>
              {line}
            </span>{" "}
          </span>
        ))}
      </h2>

      <PhotoPlate className={styles.plate} number={copy.plate.number} subject={copy.plate.subject} ratio="4 / 5" />

      {/* The archive's own ticket — a designed object, not a historical document. */}
      <div className={styles.ticket} aria-hidden="true">
        <span className={styles.ticketHead}>Soft Club Archive</span>
        <span className={styles.ticketBig}>Admit one</span>
        <span>
          Frequency {frequency.code} — {frequency.name}
        </span>
        <span className={styles.ticketRow}>
          <span>Platform —</span>
          <span>00:47</span>
        </span>
      </div>

      <aside className={styles.note} aria-labelledby="after-hours-note">
        <p id="after-hours-note" className={styles.noteLabel}>
          Curatorial note
        </p>
        <p className={styles.noteText}>{copy.curatorialNote}</p>
      </aside>

      <div className={styles.index}>
        <p className={styles.indexLabel}>
          Filed under {frequency.code} <span aria-hidden="true">—</span> {pad2(filed.length)} records
        </p>
        <ol ref={recordsRef} className={styles.records}>
          {filed.map((record, i) => (
            <li
              key={record.catalogue}
              className={styles.record}
              data-hero={record.hero || undefined}
              style={{ "--i": i } as CSSProperties}
            >
              <article className={styles.object} aria-labelledby={`record-${record.number}`}>
                <ArchiveSleeve record={record} className={styles.sleeve} />
                <div className={styles.label}>
                  <p className={styles.recordNo} aria-hidden="true">
                    {pad2(record.number)}
                  </p>
                  <h3 id={`record-${record.number}`} className={styles.recordTitle}>
                    <Link
                      className={styles.recordLink}
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
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <p className={styles.continues}>
        <Link className={styles.continuesLink} href="/music">
          {copy.continues} <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}
