import type { HTMLAttributes } from "react";
import styles from "./HeroObjects.module.css";

type ObjectProps = HTMLAttributes<HTMLDivElement> & { [data: `data-${string}`]: string | undefined };

/**
 * Secondary objects — CSS and one small inline drawing, deliberately lightweight.
 * The CD is the protagonist; these only suggest the room around it.
 */

/** Stylised MiniDisc cartridge (translucent shell, aluminium shutter). Illustration, not a product replica. */
export function MiniDisc({ className, ...rest }: ObjectProps) {
  return (
    <div className={[styles.minidisc, className].filter(Boolean).join(" ")} aria-hidden="true" {...rest}>
      <span className={styles.mdDisc} />
      <span className={styles.mdShutter} />
      <span className={styles.mdLabel}>
        <span>MD—001</span>
        <span>Soft Club</span>
      </span>
      <span className={styles.mdTab} />
    </div>
  );
}

/* The site's palette (tokens.css), as values: SVG paint attributes take no custom properties. */
const CREAM = "#e7e5db";
const PHOSPHOR = "#c6d8a7";
const STEEL = "#879291";
const DARK_STEEL = "#545d5b";

const TICKS = Array.from({ length: 9 }, (_, i) => ({ y: 150 + i * 16, x: i % 4 === 0 ? 58 : 50 }));

/**
 * Magazine fragment with a plate: ENTRANCE.
 *
 * Original artwork of the Soft Club Archive, drawn here in the Night Archive
 * language (see editorial/NightArchive): a lit doorway seen across the dark,
 * one screened panel that runs on below the fold. It is not a photograph and
 * reproduces none; nothing is loaded, filtered or animated. No circle and no
 * large type: the disc and the title own those.
 */
export function PaperSlip({ className, ...rest }: ObjectProps) {
  return (
    <div className={[styles.slip, className].filter(Boolean).join(" ")} data-artwork="original" {...rest}>
      <span className={styles.folio} aria-hidden="true">
        <span>Soft Club — Nº 001</span>
        <span>P. 01</span>
      </span>
      <span
        className={styles.plate}
        role="img"
        aria-label="Original artwork of the Soft Club Archive: an entrance. A doorway of screened light stands in the dark."
      >
        <svg className={styles.art} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="sl-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d2723" />
              <stop offset="1" stopColor="#0d1210" />
            </linearGradient>
            <linearGradient id="sl-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
            </linearGradient>
            <mask id="sl-door">
              <rect x="168" y="118" width="150" height="382" fill="url(#sl-fade)" />
            </mask>
            <radialGradient id="sl-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#2b4034" stopOpacity="0.8" />
              <stop offset="1" stopColor="#1c2b23" stopOpacity="0" />
            </radialGradient>
            <pattern id="sl-dots" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <circle cx="5.5" cy="5.5" r="3.5" fill={CREAM} />
            </pattern>
            <pattern id="sl-scan" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="1" fill={CREAM} />
            </pattern>
          </defs>

          <rect width="400" height="500" fill="url(#sl-ground)" />
          <ellipse cx="243" cy="250" rx="230" ry="270" fill="url(#sl-halo)" />

          {/* the doorway: one screened panel of light, its second colour out of register */}
          <rect x="168" y="118" width="150" height="382" fill="url(#sl-dots)" mask="url(#sl-door)" />
          <rect x="176" y="126" width="150" height="382" fill="none" stroke={PHOSPHOR} strokeWidth="1.5" opacity="0.7" />

          {/* the lintel: the hard line of the tube, and the level it sits on */}
          <rect x="0" y="117" width="400" height="1" fill={STEEL} opacity="0.45" />
          <rect x="168" y="115" width="150" height="3" fill={CREAM} opacity="0.95" />

          <rect width="400" height="500" fill="url(#sl-scan)" opacity="0.035" />

          {/* technical marks */}
          <g stroke={DARK_STEEL} strokeWidth="1.5">
            {TICKS.map(({ x, y }) => (
              <line key={y} x1="40" y1={y} x2={x} y2={y} />
            ))}
          </g>
          <path d="M97 214h22M108 203v22" stroke={CREAM} strokeWidth="1.5" opacity="0.6" />
          <path d="M16 30v-14h14M370 16h14v14" stroke={CREAM} strokeWidth="1.5" opacity="0.45" fill="none" />

          <g className={styles.plateType} fill={CREAM}>
            <text x="40" y="78">Pl. 01</text>
            <text x="360" y="78" textAnchor="end" opacity="0.6">
              Entrance
            </text>
          </g>
        </svg>
      </span>
      <span className={styles.slipCaption} aria-hidden="true">
        Plate 01 / Original
      </span>
    </div>
  );
}
