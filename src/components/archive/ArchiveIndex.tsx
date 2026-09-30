import Link from "next/link";
import type { CSSProperties } from "react";
import {
  archiveIndex as copy,
  archiveSpan,
  frequencies,
  pad2,
  records,
  recordsIn,
  spanOf,
} from "@/content/music";
import { IndexEntry } from "./IndexEntry";
import atmosphere from "./Atmosphere.module.css";
import styles from "./ArchiveIndex.module.css";

/**
 * /music — ARCHIVE_002, the complete listening index.
 *
 * A cabinet of four drawers, one per frequency, each lit by its own room
 * (night / paper alternate as in the tuner). Every record is an object
 * that opens into its file at /music/[slug].
 */
export function ArchiveIndex() {
  return (
    <main className={styles.index}>
      <a className="skip-link" href="#after-hours">
        Skip to the drawers
      </a>

      <header className={styles.head} data-theme="night">
        <div className={styles.folio}>
          <Link className={styles.back} href="/#frequencies">
            <span aria-hidden="true">←</span> {copy.entrance}
          </Link>
          <p className={styles.fileCode}>
            {copy.archive} / {copy.label}
          </p>
          <p className={styles.muted}>Audio material — {archiveSpan()}</p>
          <p className={styles.count}>
            {pad2(records.length)} records · {pad2(frequencies.length)} frequencies
          </p>
        </div>

        <h1 className={styles.title}>
          {copy.titleLines.map((line, i) => (
            <span key={line} className={styles.line} data-line={i}>
              {line}{" "}
            </span>
          ))}
        </h1>

        <div className={styles.intro}>
          <p className={styles.deck}>{copy.deck}</p>
          <p className={styles.note}>{copy.note}</p>
        </div>

        <nav className={styles.directory} aria-label="Drawers">
          <ol>
            {frequencies.map((f) => (
              <li key={f.id}>
                <a href={`#${f.id}`} className={styles.dirLink}>
                  <span className={styles.dirCode}>{f.code}</span>
                  <span className={styles.dirName}>{f.name}</span>
                  <span className={styles.dirCount}>{pad2(recordsIn(f.id).length)} records</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {frequencies.map((f, row) => {
        const filed = recordsIn(f.id);
        return (
          <section
            key={f.id}
            id={f.id}
            className={styles.drawer}
            data-frequency={f.id}
            data-tone={f.tone}
            data-theme={f.tone === "night" ? "night" : undefined}
            aria-labelledby={`drawer-${f.id}`}
            style={{ "--row": row } as CSSProperties}
          >
            <span className={atmosphere.atmosphere} data-atmosphere={f.id} aria-hidden="true" />

            <header className={styles.drawerHead}>
              <p className={styles.drawerNo}>
                {copy.drawer} {f.code}
              </p>
              <h2 id={`drawer-${f.id}`} className={styles.drawerName}>
                {f.name}
              </h2>
              <p className={styles.drawerMeta}>
                <span>{f.atmosphere.join(" · ")}</span>
                <span>
                  {spanOf(f.id)} <span aria-hidden="true">—</span> {pad2(filed.length)} records
                </span>
              </p>
            </header>

            <ol className={styles.entries}>
              {filed.map((record, i) => (
                <IndexEntry key={record.slug} record={record} index={i} />
              ))}
            </ol>
          </section>
        );
      })}

      <footer className={styles.end} data-theme="night">
        <p>End of index — {copy.archive}</p>
        <Link className={styles.back} href="/">
          Return to the entrance <span aria-hidden="true">↑</span>
        </Link>
      </footer>
    </main>
  );
}
