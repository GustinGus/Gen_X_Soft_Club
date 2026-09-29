import type { CSSProperties } from "react";
import styles from "./Placeholders.module.css";

/**
 * EDITORIAL PLACEHOLDERS — art-directed empty frames.
 *
 * They fix proportion, crop, position and treatment so curated assets can
 * drop in later. They are never presented as real photographs or covers:
 * each carries `data-placeholder`, a visible "to come" mark and an
 * accessible label that says it is a placeholder.
 */

type PlateProps = {
  number: string;
  subject: string;
  /** Aspect ratio of the final photograph, e.g. "4 / 5". */
  ratio?: string;
  tone?: "night" | "day";
  className?: string;
};

/** A photographic plate with caption — the future photograph's slot. */
export function PhotoPlate({ number, subject, ratio = "4 / 5", tone = "night", className }: PlateProps) {
  return (
    <figure className={[styles.plate, className].filter(Boolean).join(" ")} data-placeholder="photograph" data-tone={tone}>
      <div
        className={styles.frame}
        role="img"
        aria-label={`Placeholder for a photograph: ${subject}. Image to come.`}
        style={{ aspectRatio: ratio } as CSSProperties}
      >
        <span className={styles.crop} data-corner="tl" />
        <span className={styles.crop} data-corner="tr" />
        <span className={styles.crop} data-corner="bl" />
        <span className={styles.crop} data-corner="br" />
        <span className={styles.mark} aria-hidden="true">
          {number}
          <br />
          Photograph to come
        </span>
      </div>
      <figcaption className={styles.caption}>
        <span>{number}</span>
        <span>{subject}</span>
        <span className={styles.flag}>Placeholder</span>
      </figcaption>
    </figure>
  );
}

type CaseProps = {
  artist: string;
  album: string;
  catalogue: string;
  className?: string;
};

/**
 * CD jewel case with an empty artwork tray. The cover slot is square (as on
 * a real booklet); the hinge and spine are the case, not the art.
 * PLACEHOLDER until licensed artwork exists (see MusicRecord.artwork).
 */
export function JewelCase({ artist, album, catalogue, className }: CaseProps) {
  return (
    <div
      className={[styles.case, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={`Placeholder for the cover of ${album} by ${artist}. Artwork to come.`}
      data-placeholder="artwork"
    >
      <span className={styles.hinge} aria-hidden="true" />
      <span className={styles.tray} aria-hidden="true">
        <span className={styles.trayLabel}>
          {catalogue}
          <br />
          Artwork to come
        </span>
      </span>
      <span className={styles.sheen} aria-hidden="true" />
    </div>
  );
}
