import { recordFileCopy as copy } from "@/content/music";
import styles from "./PendingMark.module.css";

/**
 * PENDING — SOURCE REQUIRED, set like an archivist's stamp.
 * Real text (read aloud as-is), never a blank or a guess.
 */
export function PendingMark({ size = "field" }: { size?: "field" | "block" }) {
  return (
    <span className={styles.pending} data-size={size}>
      <span className={styles.word}>{copy.pending}</span>
      <span className={styles.rule} aria-hidden="true">
        —
      </span>
      <span className={styles.required}>{copy.sourceRequired}</span>
    </span>
  );
}
