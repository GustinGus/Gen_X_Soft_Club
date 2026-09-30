import type { Sourced } from "@/content/records";
import { PendingMark } from "./PendingMark";
import styles from "./SourcedValue.module.css";

/** DOM id of a record's source entry — the footnote target. */
export const sourceId = (slug: string, index: number) => `source-${slug}-${index + 1}`;

/**
 * A documented value with its footnotes — or the PENDING stamp.
 * There is no third state: a value without a source cannot render.
 */
export function SourcedValue({ field, slug }: { field: Sourced<string>; slug: string }) {
  if (field.status === "pending") return <PendingMark />;

  return (
    <>
      {field.value}
      {field.note && <span className={styles.qualifier}> ({field.note})</span>}
      {field.sources.map((i) => (
        <a key={i} className={styles.ref} href={`#${sourceId(slug, i)}`} aria-label={`Source ${i + 1}`}>
          {i + 1}
        </a>
      ))}
    </>
  );
}
