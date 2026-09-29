"use client";

import { useRef, type CSSProperties } from "react";
import { soundOfTheClub as copy } from "@/content/music";
import { DiscAnchor } from "@/experience/disc/DiscAnchor";
import { useReveal } from "@/motion/useReveal";
import styles from "./SoundOfTheClub.module.css";

/**
 * THE SOUND OF THE CLUB — the archive's first room.
 *
 * Continues the manifesto's night without a seam: the manifesto's grid
 * dissolves at the top, ARCHIVE_002 metadata surfaces, and the same disc
 * (third DiscAnchor station) settles large behind the title.
 */
export function SoundOfTheClub() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, 0.12);

  return (
    <section ref={ref} id="sound" className={styles.sound} aria-labelledby="sound-title" data-theme="night">
      {/* The manifesto's 12-column structure, dissolving as the reader descends. */}
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <header className={styles.archive}>
        <p className={styles.archiveId}>{copy.archive}</p>
        <p>{copy.material}</p>
        <p className={styles.muted}>{copy.range}</p>
      </header>

      <p className={styles.format}>
        {copy.format.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>

      <h2 id="sound-title" className={styles.title}>
        {copy.titleLines.map((line, i) => (
          <span key={line} className={styles.line} data-line={i}>
            <span className={styles.lineInner} style={{ "--i": i } as CSSProperties}>
              {line}
            </span>{" "}
          </span>
        ))}
      </h2>

      <DiscAnchor name="sound" className={styles.disc} />

      <div className={styles.question}>
        <p className={styles.questionLabel} aria-hidden="true">
          Q.
        </p>
        <p className={styles.questionText}>
          {copy.question.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <p className={styles.deck}>{copy.deck}</p>
      </div>
    </section>
  );
}
