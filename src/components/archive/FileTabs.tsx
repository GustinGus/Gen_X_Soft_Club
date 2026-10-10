import Link from "next/link";
import type { MusicRecord } from "@/content/music";
import type { Dictionary } from "@/i18n/dictionary";
import styles from "./FileTabs.module.css";

type Props = { prev: MusicRecord | null; next: MusicRecord | null; copy: Dictionary["record"]["tabs"] };

/**
 * FILE TABS — the neighbouring cards in the drawer, their tabs showing.
 * Direction is a transition type, so the file slides the way you leafed.
 * The index has ends: no wrap-around; the last tab returns to the index.
 */
export function FileTabs({ prev, next, copy }: Props) {
  return (
    <nav className={styles.tabs} aria-label={copy.label}>
      {prev ? (
        <Link className={styles.tab} data-side="prev" href={`/music/${prev.slug}`} transitionTypes={["file-prev"]} rel="prev">
          <span className={styles.dir}>
            <span aria-hidden="true">←</span> {copy.prev}
          </span>
          <span className={styles.no}>{prev.catalogue}</span>
          <span className={styles.name}>
            {prev.artist} — {prev.album}
          </span>
        </Link>
      ) : (
        <p className={styles.tab} data-side="prev" data-end>
          <span className={styles.dir}>{copy.startOfIndex}</span>
        </p>
      )}

      {next ? (
        <Link className={styles.tab} data-side="next" href={`/music/${next.slug}`} transitionTypes={["file-next"]} rel="next">
          <span className={styles.dir}>
            {copy.next} <span aria-hidden="true">→</span>
          </span>
          <span className={styles.no}>{next.catalogue}</span>
          <span className={styles.name}>
            {next.artist} — {next.album}
          </span>
        </Link>
      ) : (
        <Link className={styles.tab} data-side="next" href="/music" transitionTypes={["archive-return"]}>
          <span className={styles.dir}>
            {copy.endOfIndex} <span aria-hidden="true">→</span>
          </span>
          <span className={styles.name}>{copy.backToIndex}</span>
        </Link>
      )}
    </nav>
  );
}
