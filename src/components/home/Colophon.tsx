"use client";

import Link from "next/link";
import { colophon } from "@/content/home";
import { pad2 } from "@/content/music";
import { countWord, fill } from "@/i18n/format";
import { href } from "@/i18n/href";
import { useCopy, useLocale } from "@/i18n/I18nProvider";
import styles from "./Colophon.module.css";

/* The site's palette (tokens.css), as values: SVG paint attributes take no custom properties. */
const CREAM = "#e7e5db";
const PHOSPHOR = "#c6d8a7";
const DARK_STEEL = "#545d5b";

const TICKS = Array.from({ length: 25 }, (_, i) => ({ x: i * 10 + 0.5, y: i % 6 === 0 ? 12 : 6 }));

/**
 * COLOPHON — the Home's last page, and the site's footer there.
 *
 * The back of the sleeve: what this is, who made it, and the way on to the
 * listening index. Every count and year is read from the catalogue
 * (content/home.ts); the wording is the page's language. Static on purpose:
 * nothing here reveals or moves.
 */
export function Colophon() {
  const locale = useLocale();
  const dictionary = useCopy();
  const copy = dictionary.colophon;
  const [first, last] = copy.titleLines;

  return (
    <footer id="colophon" className={styles.colophon} aria-labelledby="colophon-title" data-theme="night">
      <div className={styles.folio}>
        <p className={styles.code}>
          <span className={styles.dot} aria-hidden="true" />
          {copy.label}
        </p>
        <p className={styles.muted}>{copy.issue}</p>
        <p className={`${styles.muted} ${styles.right}`}>
          {copy.end} <span aria-hidden="true">—</span> {colophon.span}
        </p>
      </div>

      <h2 id="colophon-title" className={styles.title}>
        <span className={styles.lineLight}>{first}</span> <span className={styles.lineHeavy}>{last}</span>
      </h2>

      {/* The end mark: the square that closes a magazine piece, screened, its second colour out of register. */}
      <div className={styles.endMark} aria-hidden="true">
        <svg className={styles.mark} viewBox="0 0 120 120" focusable="false">
          <defs>
            <pattern id="co-dots" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <circle cx="4" cy="4" r="2.6" fill={CREAM} />
            </pattern>
            <linearGradient id="co-fade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.25" />
            </linearGradient>
            <mask id="co-square">
              <rect x="14" y="14" width="80" height="80" fill="url(#co-fade)" />
            </mask>
          </defs>
          <rect x="14" y="14" width="80" height="80" fill="url(#co-dots)" mask="url(#co-square)" />
          <rect x="22" y="22" width="80" height="80" fill="none" stroke={PHOSPHOR} strokeWidth="1.25" opacity="0.75" />
          <path d="M0 8v-8h8M112 0h8v8M120 112v8h-8M8 120h-8v-8" fill="none" stroke={CREAM} strokeWidth="1.25" opacity="0.45" />
        </svg>
        <p className={styles.muted}>
          {colophon.mark}
          <br />
          {pad2(colophon.records)} / {pad2(colophon.frequencies)}
        </p>
      </div>

      <div className={styles.body}>
        <p className={styles.deck}>
          {fill(copy.deck, { records: countWord(dictionary, colophon.records), frequencies: countWord(dictionary, colophon.frequencies, "feminine") })}
        </p>
        <Link className={styles.cta} href={href(locale, "/music")}>
          <span className={styles.ctaIndex} aria-hidden="true">
            02
          </span>
          <span>{copy.cta}</span>
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <svg className={styles.rule} viewBox="0 0 250 12" preserveAspectRatio="xMinYMin meet" aria-hidden="true" focusable="false">
        <g stroke={DARK_STEEL} strokeWidth="1">
          {TICKS.map(({ x, y }) => (
            <line key={x} x1={x} y1="0" x2={x} y2={y} />
          ))}
        </g>
      </svg>

      <dl className={styles.imprint}>
        {copy.imprint.map(({ term, value }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.foot}>
        <p className={styles.muted}>{copy.artwork}</p>
        <a className={styles.back} href="#lobby">
          {copy.back} <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
