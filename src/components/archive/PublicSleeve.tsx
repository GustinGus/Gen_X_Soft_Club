import type { CSSProperties } from "react";
import { frequencyOf, pad2, records, type FrequencyId, type MusicRecord } from "@/content/music";
import type { Sleeve } from "@/content/sleeves";
import styles from "./PublicSleeve.module.css";

/**
 * PUBLIC SLEEVE — a record's sleeve in the archive's own hand.
 *
 * One grid for every sleeve (1000 × 1000, 60 margin, twelve columns): the
 * archive line on top, the figure in the upper field, the names below it and
 * the catalogue line at the foot. What is printed in the field is the record's
 * running order, read from its data and from nothing else:
 *
 *   frequency        → the family: paper, ink, second colour, screen, and the
 *                      figure (strata · tape · bars · fragments)
 *   number of tracks → how many pieces the figure has
 *   a track's length → the size of its piece (and, by its remainder, where
 *                      the piece is trimmed)
 *   running order    → the order of the pieces; every other one is screened
 *                      (in the fragments, by turns in dots and in lines)
 *   longest track    → the piece printed in the second colour
 *   shortest track   → the piece left unprinted, in outline
 *   total length     → the tilt of the figure, as a sheet fed slightly askew
 *   year             → the column of the tinted band
 *   archive number   → the large numeral standing behind the names
 *   length of names  → the size of the artist's line: the largest that keeps
 *                      it on one line, or, when that would be too small, the
 *                      largest that sets it on two
 *
 * Nothing is random and nothing is measured at run time: the same data gives
 * the same sleeve, on the server and in the browser.
 */

const MARGIN = 60;
const WIDTH = 1000 - MARGIN * 2;
const COLUMN = WIDTH / 12;
const FIELD_TOP = 120;
const FIELD_HEIGHT = 430;
const GAP = 10;

type Role = "solid" | "screen" | "lines" | "accent" | "void";
type Piece = { x: number; y: number; w: number; h: number; r: number; role: Role };

const r2 = (n: number) => Math.round(n * 100) / 100;

function roleOf(tracks: readonly number[], i: number): Role {
  if (i === tracks.indexOf(Math.max(...tracks))) return "accent";
  if (i === tracks.indexOf(Math.min(...tracks))) return "void";
  return i % 2 === 0 ? "solid" : "screen";
}

/** AFTER HOURS — strips laid one under another; a track's length is its strip's depth. */
function strata(tracks: readonly number[], total: number): Piece[] {
  const depth = FIELD_HEIGHT - GAP * (tracks.length - 1);
  let y = FIELD_TOP;
  return tracks.map((d, i) => {
    const h = (depth * d) / total;
    const from = d % 4;
    const short = Math.floor(d / 10) % 3;
    const piece = { x: MARGIN + COLUMN * from, y, w: WIDTH - COLUMN * (from + short), h, r: 0, role: roleOf(tracks, i) };
    y += h + GAP;
    return piece;
  });
}

/** SOFT FUTURE — one tape wound over the rows; a track's length is its run of tape. */
function tape(tracks: readonly number[], total: number): Piece[] {
  const rows = Math.round(tracks.length / 4);
  const rowHeight = FIELD_HEIGHT / rows;
  const h = rowHeight - GAP * 1.4;
  const length = WIDTH * rows;
  const pieces: Piece[] = [];
  let at = 0;
  tracks.forEach((d, i) => {
    const end = at + (length * d) / total;
    let from = at;
    const until = end - GAP;
    while (from < until - 1) {
      const row = Math.floor(from / WIDTH);
      const stop = Math.min(until, (row + 1) * WIDTH);
      // a run cut at a row's end can leave a sliver: narrower than the gap between pieces, it is not printed
      if (stop - from >= GAP) {
        pieces.push({ x: MARGIN + (from - row * WIDTH), y: FIELD_TOP + row * rowHeight, w: stop - from, h, r: h / 2, role: roleOf(tracks, i) });
      }
      from = stop;
    }
    at = end;
  });
  return pieces;
}

/** CITY FREQUENCY — bars standing in a row; a track's length is its bar's width. */
function bars(tracks: readonly number[], total: number): Piece[] {
  const span = WIDTH - GAP * (tracks.length - 1);
  let x = MARGIN;
  return tracks.map((d, i) => {
    const w = (span * d) / total;
    const drop = (d % 4) * (FIELD_HEIGHT / 8);
    const piece = { x, y: FIELD_TOP + drop, w, h: FIELD_HEIGHT - drop, r: 0, role: roleOf(tracks, i) };
    x += w + GAP;
    return piece;
  });
}

const CELLS = 12;
const CELL_ROWS = 4;
/** The share of its span a fragment prints; the rest stays paper. */
const PRINTED = 0.78;

/**
 * ALTERNATIVE SIGNAL — a sheet cut into blocks. The running order is read
 * across a grid of half-cells, row after row: a track's length is its block's
 * run, and what it does not print is left as a gap. Blocks are trimmed from
 * the top or from the foot by turns.
 */
function fragments(tracks: readonly number[], total: number): Piece[] {
  const rowHeight = FIELD_HEIGHT / CELL_ROWS;
  const pieces: Piece[] = [];
  let at = 0;
  tracks.forEach((d, i) => {
    const span = (CELLS * CELL_ROWS * d) / total;
    const start = Math.round(at * 2) / 2;
    const end = Math.max(start + 0.5, Math.round((at + span * PRINTED) * 2) / 2);
    const trim = ((d % 3) * rowHeight) / 6;
    const h = rowHeight - GAP - trim;
    const base = roleOf(tracks, i);
    const role: Role = base === "screen" && i % 4 === 3 ? "lines" : base;
    let from = start;
    while (from < end) {
      const row = Math.floor(from / CELLS);
      const stop = Math.min(end, (row + 1) * CELLS);
      pieces.push({
        x: MARGIN + (from - row * CELLS) * COLUMN + GAP / 2,
        y: FIELD_TOP + row * rowHeight + (i % 2 === 0 ? 0 : trim),
        w: (stop - from) * COLUMN - GAP,
        h,
        r: 0,
        role,
      });
      from = stop;
    }
    at += span;
  });
  return pieces;
}

type Family = { figure: (tracks: readonly number[], total: number) => Piece[]; screen: number };

/** A family per frequency. */
const families: Record<FrequencyId, Family> = {
  "after-hours": { figure: strata, screen: 14 },
  "soft-future": { figure: tape, screen: 18 },
  "city-frequency": { figure: bars, screen: 24 },
  "alternative-signal": { figure: fragments, screen: 30 },
};

/**
 * The artist's line, in container-width units. The largest size that keeps
 * the name on one line; when that would be under 10, the largest that sets it
 * on two. Never wider than its longest word allows. A character of the
 * condensed capitals is taken as 0.533 of the size, the widest average among
 * the names set in it, so the line is 165 / length at most.
 */
function artistSize(artist: string) {
  const longest = Math.max(...artist.split(/\s+/).map((w) => w.length));
  const oneLine = 165 / artist.length;
  return r2(Math.min(20, 150 / longest, oneLine >= 10 ? oneLine : 280 / artist.length));
}

export function PublicSleeve({ record, sleeve }: { record: MusicRecord; sleeve: Sleeve }) {
  const family = families[record.frequency];
  const frequency = frequencyOf(record.frequency);
  const total = sleeve.tracks.reduce((a, b) => a + b, 0);
  const pieces = family.figure(sleeve.tracks, total);
  const tilt = r2(((total % 60) / 60) * 8 - 4);
  const band = MARGIN + COLUMN * (record.year % 10);
  const screenId = `sleeve-screen-${record.frequency}`;
  const linesId = `sleeve-lines-${record.frequency}`;
  const turn = `rotate(${tilt} 500 ${FIELD_TOP + FIELD_HEIGHT / 2})`;

  return (
    <span
      className={styles.sleeve}
      role="img"
      aria-label={`Catalogue sleeve for ${record.album} by ${record.artist}: original artwork of the Soft Club Archive.`}
      data-sleeve="public"
      data-family={record.frequency}
      style={{ "--artist": artistSize(record.artist) } as CSSProperties}
    >
      <svg className={styles.art} viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={screenId} width={family.screen} height={family.screen} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle className={styles.dot} cx={family.screen / 2} cy={family.screen / 2} r={r2(family.screen * 0.3)} />
          </pattern>
          {pieces.some((p) => p.role === "lines") && (
            <pattern id={linesId} width={family.screen} height={r2(family.screen * 0.6)} patternUnits="userSpaceOnUse">
              <rect className={styles.dot} width={family.screen} height={r2(family.screen * 0.26)} />
            </pattern>
          )}
        </defs>

        <rect className={styles.band} x={r2(band)} y="0" width={r2(Math.min(COLUMN * 3, 1000 - MARGIN - band))} height="1000" />
        <path className={styles.mark} d={`M${r2(band)} 78v34M${r2(band - 17)} 95h34`} />

        {/* the second colour, printed a little out of register under the ink */}
        <g className={styles.ghost} transform={`translate(9 9) ${turn}`}>
          {pieces.map((p, i) => p.role !== "void" && <rect key={i} x={r2(p.x)} y={r2(p.y)} width={r2(p.w)} height={r2(p.h)} rx={r2(p.r)} />)}
        </g>
        <g transform={turn}>
          {pieces.map((p, i) => (
            <rect
              key={i}
              className={styles[p.role]}
              fill={p.role === "screen" ? `url(#${screenId})` : p.role === "lines" ? `url(#${linesId})` : undefined}
              x={r2(p.x)}
              y={r2(p.y)}
              width={r2(p.w)}
              height={r2(p.h)}
              rx={r2(p.r)}
            />
          ))}
        </g>

        <text className={styles.numeral} x="946" y="884" textAnchor="end">
          {pad2(record.number)}
        </text>
      </svg>

      <span className={styles.head} aria-hidden="true">
        <span>{record.catalogue}</span>
        <span>Soft Club Archive</span>
      </span>
      <span className={styles.names} aria-hidden="true">
        <span className={styles.artist}>{record.artist}</span>
        <span className={styles.album}>{record.album}</span>
      </span>
      <span className={styles.foot} aria-hidden="true">
        <span>{record.year}</span>
        <span>
          {frequency.code} — {frequency.name}
        </span>
        <span>
          {pad2(record.number)} / {pad2(records.length)}
        </span>
      </span>
    </span>
  );
}
