import styles from "./NightArchive.module.css";

/**
 * NIGHT ARCHIVE — the After Hours plate.
 *
 * Original artwork of the Soft Club Archive, drawn here: one inline SVG of
 * plain shapes and type. It is not a photograph and reproduces none; nothing
 * is loaded, filtered or animated. The lettering is the section's own data,
 * so the plate and the ticket beside it cannot disagree, and it is set as
 * drawn in every language; the caption and the description are the page's.
 */

/* The site's palette (tokens.css), as values: SVG paint attributes take no custom properties. */
const CREAM = "#e7e5db";
const PHOSPHOR = "#c6d8a7";
const STEEL = "#879291";
const DARK_STEEL = "#545d5b";
const NIGHT = "#080a09";
const DEEP_GREEN = "#101512";

/* Where the platform's lines meet. */
const VP_X = 430;
const VP_Y = 585;

const RAILS = [-260, -90, 80, 250, 420, 590, 760, 930, 1100];
const SLEEPERS = [0.16, 0.3, 0.45, 0.61, 0.78, 0.95].map((t) => (VP_Y + 415 * t * t).toFixed(1));
const TICKS = Array.from({ length: 23 }, (_, i) => ({ y: 120 + i * 20, x: i % 5 === 0 ? 62 : 52 }));

type Props = {
  /** "Plate 02", as lettered on the plate. */
  number: string;
  /** The frequency this plate belongs to. */
  frequency: { code: string; name: string; atmosphere: readonly string[] };
  /** The archive's shelf mark for the frequency, e.g. "SC—AH". */
  shelf: string;
  /** Years of the records filed here. */
  span: string;
  /** The lines shared with the ticket. */
  line: string;
  platform: string;
  time: string;
  /** Under the plate, in the page's language: its number, what it shows, and what kind of image it is. */
  caption: { number: string; subject: string; flag: string };
  /** What the plate shows, for those who cannot see it, in the page's language. */
  artwork: string;
  className?: string;
};

export function NightArchivePlate({ number, frequency, shelf, span, line, platform, time, caption, artwork, className }: Props) {
  const [hours, minutes] = time.split(":");

  return (
    <figure className={[styles.plate, className].filter(Boolean).join(" ")} data-artwork="original">
      <div
        className={styles.frame}
        role="img"
        aria-label={artwork}
      >
        <svg className={styles.art} viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="na-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#151d19" />
              <stop offset="0.55" stopColor={NIGHT} />
              <stop offset="1" stopColor={DEEP_GREEN} />
            </linearGradient>
            <linearGradient id="na-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={CREAM} stopOpacity="0" />
              <stop offset="0.5" stopColor={CREAM} stopOpacity="0.2" />
              <stop offset="1" stopColor={CREAM} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="na-shaft" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={CREAM} stopOpacity="0.13" />
              <stop offset="1" stopColor={CREAM} stopOpacity="0.02" />
            </linearGradient>
            <radialGradient id="na-fade" cx="0.3" cy="0.34" r="0.78">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.75" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
            </radialGradient>
            <mask id="na-lamp">
              <circle cx="520" cy="352" r="236" fill="url(#na-fade)" />
            </mask>
            <radialGradient id="na-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#2b4034" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#1c2b23" stopOpacity="0.5" />
              <stop offset="1" stopColor="#1c2b23" stopOpacity="0" />
            </radialGradient>
            <pattern id="na-dots" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <circle cx="8" cy="8" r="5.2" fill={CREAM} />
            </pattern>
            <pattern id="na-fine" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <circle cx="4.5" cy="4.5" r="2" fill={CREAM} />
            </pattern>
            <pattern id="na-scan" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="1" fill={CREAM} />
            </pattern>
            <pattern id="na-hatch" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="5" fill={CREAM} />
            </pattern>
            <clipPath id="na-edge">
              <polygon points={`${VP_X},${VP_Y} 590,1000 760,1000`} />
            </clipPath>
          </defs>

          <rect width="800" height="1000" fill="url(#na-ground)" />

          {/* night air: a green halo where the lamp hangs, and a shaft of light falling behind it to the platform */}
          <circle cx="520" cy="352" r="420" fill="url(#na-halo)" />
          <polygon points="800,60 800,170 250,585 130,585" fill="url(#na-shaft)" />

          {/* the lamp: a screened disc, eclipsed, with its second colour out of register */}
          <circle cx="520" cy="352" r="236" fill="url(#na-dots)" mask="url(#na-lamp)" />
          <circle cx="606" cy="316" r="176" fill="#0c110f" />
          <circle cx="606" cy="316" r="176" fill="url(#na-fine)" opacity="0.1" />
          <circle cx="531" cy="363" r="236" fill="none" stroke={PHOSPHOR} strokeWidth="1.5" opacity="0.7" />
          <path d="M506 352h28M520 338v28" stroke={CREAM} strokeWidth="1.5" opacity="0.8" />

          {/* the platform: lines to a vanishing point, sleepers, a screened edge */}
          <g stroke={STEEL} strokeWidth="1.5" opacity="0.5" fill="none">
            {RAILS.map((x) => (
              <line key={x} x1={VP_X} y1={VP_Y} x2={x} y2="1000" />
            ))}
          </g>
          <g stroke={STEEL} strokeWidth="1" opacity="0.28">
            {SLEEPERS.map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} />
            ))}
          </g>
          <rect x="0" y={VP_Y} width="800" height="415" fill="url(#na-hatch)" opacity="0.5" clipPath="url(#na-edge)" />

          {/* the tube: one hard line of light and its glow, with two fainter echoes */}
          <rect x="0" y="520" width="800" height="130" fill="url(#na-glow)" />
          <rect x="0" y="583" width="800" height="3" fill={CREAM} opacity="0.92" />
          <rect x="0" y="598" width="800" height="1.5" fill={CREAM} opacity="0.35" />
          <rect x="0" y="610" width="800" height="1" fill={CREAM} opacity="0.18" />

          <rect width="800" height="1000" fill="url(#na-scan)" opacity="0.035" />

          {/* technical marks: a rule down the quiet left side, crop marks in the corners */}
          <g stroke={DARK_STEEL} strokeWidth="1.5">
            {TICKS.map(({ x, y }) => (
              <line key={y} x1="40" y1={y} x2={x} y2={y} />
            ))}
          </g>
          <path d="M18 34v-16h16M766 18h16v16M782 966v16h-16M34 982h-16v-16" stroke={CREAM} strokeWidth="1.5" opacity="0.45" fill="none" />

          {/* the lines of text */}
          <g className={styles.mono} fill={CREAM}>
            <rect x="150" y="50" width="11" height="11" fill={PHOSPHOR} />
            <text x="172" y="61">Night Archive</text>
            <text x="172" y="88" opacity="0.55">
              {number} — {frequency.name}
            </text>
            <text x="760" y="61" textAnchor="end">
              {shelf}
            </text>
            <text x="760" y="88" textAnchor="end" opacity="0.55">
              {span}
            </text>
            <text x="152" y="742" opacity="0.7">
              {line}
            </text>
            <text x="760" y="742" textAnchor="end" opacity="0.7">
              {platform}
            </text>
            <text className={styles.small} transform="translate(772 130) rotate(90)" opacity="0.5">
              {[`Frequency ${frequency.code}`, ...frequency.atmosphere].join(" · ")}
            </text>
          </g>
          <text className={styles.time} x="146" y="930" fill={CREAM}>
            {hours}
            <tspan fill={PHOSPHOR}>:</tspan>
            {minutes}
          </text>
        </svg>
      </div>
      <figcaption className={styles.caption}>
        <span>{caption.number}</span>
        <span>{caption.subject}</span>
        <span className={styles.flag}>{caption.flag}</span>
      </figcaption>
    </figure>
  );
}
