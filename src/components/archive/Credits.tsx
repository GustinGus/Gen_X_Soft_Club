import type { Credit, RecordFile } from "@/content/records";
import { PendingMark } from "./PendingMark";
import { sourceId } from "./SourcedValue";
import styles from "./Credits.module.css";

/**
 * CREDITS — who made the record, as the sources document it: one row per
 * role, set like the catalogue card's fields. Only confirmed credits are
 * printed, so a list may be short; with none confirmed it is PENDING.
 */
export function Credits({ file, slug }: { file: RecordFile; slug: string }) {
  const { credits } = file;
  if (credits.status === "pending") return <PendingMark size="block" />;

  // one row per role, in the order the roles first appear
  const roles = new Map<string, Credit[]>();
  for (const credit of credits.value) roles.set(credit.role, [...(roles.get(credit.role) ?? []), credit]);

  return (
    <div className={styles.credits}>
      <dl className={styles.rows}>
        {[...roles].map(([role, entries]) => (
          <div key={role} className={styles.row}>
            <dt>{role}</dt>
            <dd>
              {entries.map((entry, i) => (
                <span key={i} className={styles.entry}>
                  {entry.names.join(", ")}
                  {entry.note && <span className={styles.note}> ({entry.note})</span>}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.sources}>
        As documented by the sources
        {credits.sources.map((i) => (
          <a key={i} className={styles.ref} href={`#${sourceId(slug, i)}`} aria-label={`Source ${i + 1}`}>
            {i + 1}
          </a>
        ))}
      </p>
    </div>
  );
}
