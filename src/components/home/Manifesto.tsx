"use client";

import type { CSSProperties, Ref } from "react";
import { manifesto } from "@/content/home";
import { DiscAnchor } from "@/experience/disc/DiscAnchor";
import styles from "./Manifesto.module.css";

type Props = {
  ref?: Ref<HTMLElement>;
  headingRef?: Ref<HTMLHeadingElement>;
};

/**
 * Inside the club. First editorial composition.
 * The same disc from the lobby re-settles here (DiscAnchor "manifesto").
 *
 * `data-reveal` is owned by HomeExperience (set directly on the DOM, no
 * re-render): absent = server / no-JS, fully visible; "pending"; "revealed".
 */
export function Manifesto({ ref, headingRef }: Props) {
  return (
    <section
      ref={ref}
      id="manifesto"
      className={styles.manifesto}
      aria-labelledby="manifesto-title"
      data-theme="night"
    >
      <header className={styles.folio}>
        <p className={styles.id}>{manifesto.id}</p>
        <p className={styles.range}>{manifesto.range}</p>
      </header>

      <h2 id="manifesto-title" ref={headingRef} tabIndex={-1} className={styles.headline}>
        {manifesto.lines.map((line, i) => (
          <span key={line} className={styles.line} data-line={i}>
            <span className={styles.lineInner} style={{ "--i": i } as CSSProperties}>
              {line}
            </span>{" "}
          </span>
        ))}
      </h2>

      <DiscAnchor name="manifesto" className={styles.disc} />

      <div className={styles.body}>
        <p className={styles.deck}>{manifesto.intro}</p>
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          {manifesto.status}
        </p>
      </div>
    </section>
  );
}
