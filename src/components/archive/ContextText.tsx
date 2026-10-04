import { sourceId } from "./SourcedValue";
import refs from "./SourcedValue.module.css";

type Props = {
  /** Paragraphs separated by a blank line. */
  text: string;
  /** Indexes into the record's `sources`. */
  sources: readonly number[];
  slug: string;
  className?: string;
};

/**
 * DOCUMENTED HISTORY — the context set as paragraphs, its footnotes after
 * the last one. The sources answer for the whole text, not for each claim.
 */
export function ContextText({ text, sources, slug, className }: Props) {
  const paragraphs = text.split("\n\n");

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={className}>
          {paragraph}
          {i === paragraphs.length - 1 &&
            sources.map((s) => (
              <a key={s} className={refs.ref} href={`#${sourceId(slug, s)}`} aria-label={`Source ${s + 1}`}>
                {s + 1}
              </a>
            ))}
        </p>
      ))}
    </>
  );
}
