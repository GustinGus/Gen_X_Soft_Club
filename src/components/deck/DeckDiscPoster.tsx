import styles from "./DeckDiscPoster.module.css";

/**
 * The record's disc in CSS — the Phase 1 poster disc (same proportions,
 * same muted diffraction), seen face-on from above, with the archive's own
 * hub print. Used inside the deck window, for mobile / no-WebGL, and as the
 * first frame of the future flight.
 *
 * When the disc turns, only its print turns: the diffraction is light on
 * the surface, fixed to the room, so it stays where it is.
 */
export function DeckDiscPoster({
  catalogue,
  part,
  className,
}: {
  catalogue: string;
  /** Which view of the disc this is, for the deck's motion. */
  part?: string;
  className?: string;
}) {
  return (
    <span className={[styles.disc, className].filter(Boolean).join(" ")} data-deck-disc={part} aria-hidden="true">
      <span className={styles.face} />
      <span className={styles.print} data-disc-print="">
        <span className={styles.hub}>{catalogue}</span>
      </span>
    </span>
  );
}
