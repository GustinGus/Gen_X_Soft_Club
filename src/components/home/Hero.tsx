"use client";

import type { CSSProperties, MouseEvent, Ref } from "react";
import { archive, axes, hero } from "@/content/home";
import { DiscAnchor } from "@/experience/disc/DiscAnchor";
import { EnterButton } from "./EnterButton";
import { MiniDisc, PaperSlip } from "./HeroObjects";
import styles from "./Hero.module.css";

type Props = {
  ref?: Ref<HTMLElement>;
  onEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
  motionPaused?: boolean;
  /** Absent when the OS already asks for reduced motion (nothing to pause). */
  onToggleMotion?: () => void;
};

/**
 * The lobby. A spatial composition in layers:
 *   back type (GEN X) → disc (WebGL, fixed layer) → front type (SOFT CLUB)
 *
 * `data-shot` marks what the ENTER sequence choreographs;
 * `data-parallax` + `--depth` opt a layer into pointer parallax.
 */
export function Hero({ ref, onEnter, motionPaused = false, onToggleMotion }: Props) {
  const [back, front] = hero.titleLines;
  const [frontA, frontB] = front.split(" ");

  return (
    <section ref={ref} id="lobby" className={styles.hero} aria-labelledby="hero-title" data-theme="day">
      <span className={styles.registration} data-corner="tl" aria-hidden="true" />
      <span className={styles.registration} data-corner="tr" aria-hidden="true" />
      <span className={styles.registration} data-corner="bl" aria-hidden="true" />
      <span className={styles.registration} data-corner="br" aria-hidden="true" />

      <header className={styles.rail} data-shot="chrome">
        <p className={styles.masthead}>
          <span>{archive.name}</span>
          <span className={styles.muted}>{archive.issue}</span>
        </p>
        <ul className={styles.axes} aria-label="Editorial axes">
          {axes.map((axis) => (
            <li key={axis.code}>
              <span className={styles.muted} aria-hidden="true">
                {axis.code}
              </span>
              {axis.label}
            </li>
          ))}
        </ul>
        {onToggleMotion && (
          <button type="button" className={styles.motion} aria-pressed={!motionPaused} onClick={onToggleMotion}>
            <span className={styles.muted}>Motion</span> {motionPaused ? "Off" : "On"}
          </button>
        )}
      </header>

      <h1 id="hero-title" className={styles.title} translate="no">
        <span className={styles.titleBack} data-shot="title-back" data-parallax style={{ "--depth": 0.6 } as CSSProperties}>
          {back}
        </span>{" "}
        <span className={styles.titleFront} data-shot="title-front" data-parallax style={{ "--depth": 1.4 } as CSSProperties}>
          <span>{frontA}</span> <span>{frontB}</span>
        </span>
      </h1>

      <DiscAnchor name="hero" rotatable className={styles.disc} />

      <p className={styles.caption} data-shot="aside" data-parallax aria-hidden="true">
        {hero.objectCaption.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <p className={styles.span} data-shot="aside" data-parallax>
        {archive.span}
      </p>

      <MiniDisc className={styles.minidisc} data-shot="object" data-parallax="" style={{ "--depth": 0.9 } as CSSProperties} />
      <PaperSlip className={styles.slip} data-shot="object" data-parallax="" style={{ "--depth": 1.8 } as CSSProperties} />

      <div className={styles.entry} data-shot="entry">
        <p className={styles.intro}>
          {hero.intro[0]}
          <br />
          {hero.intro[1]}
        </p>
        <EnterButton label={hero.cta} onEnter={onEnter} />
      </div>
    </section>
  );
}
