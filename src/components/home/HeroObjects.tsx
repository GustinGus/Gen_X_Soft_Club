import type { HTMLAttributes } from "react";
import styles from "./HeroObjects.module.css";

type ObjectProps = HTMLAttributes<HTMLDivElement> & { [data: `data-${string}`]: string | undefined };

/**
 * Secondary objects — CSS only, deliberately lightweight.
 * The CD is the protagonist; these only suggest the room around it.
 */

/** Stylised MiniDisc cartridge (translucent shell, aluminium shutter). Illustration, not a product replica. */
export function MiniDisc({ className, ...rest }: ObjectProps) {
  return (
    <div className={[styles.minidisc, className].filter(Boolean).join(" ")} aria-hidden="true" {...rest}>
      <span className={styles.mdDisc} />
      <span className={styles.mdShutter} />
      <span className={styles.mdLabel}>
        <span>MD—001</span>
        <span>Soft Club</span>
      </span>
      <span className={styles.mdTab} />
    </div>
  );
}

/**
 * Magazine fragment with a photographic plate.
 * PLACEHOLDER: the plate is an art-directed empty frame, clearly labelled.
 * Replace with a licensed / sourced photograph in the photography phase.
 */
export function PaperSlip({ className, ...rest }: ObjectProps) {
  return (
    <div className={[styles.slip, className].filter(Boolean).join(" ")} aria-hidden="true" data-placeholder="photograph" {...rest}>
      <span className={styles.folio}>
        <span>Soft Club — Nº 001</span>
        <span>P. 01</span>
      </span>
      <span className={styles.plate}>
        <span className={styles.plateLabel}>
          Plate 01
          <br />
          Photograph to come
        </span>
      </span>
      <span className={styles.slipCaption}>Image / Placeholder</span>
    </div>
  );
}
