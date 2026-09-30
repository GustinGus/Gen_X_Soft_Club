/**
 * Motion tokens for JS-driven motion (WAAPI + WebGL).
 * Mirrors the CSS tokens in src/styles/tokens.css — keep both in sync.
 */

/**
 * The ENTER push: a small, immediate initial velocity (the click is answered
 * on the first frames) that keeps accelerating into the cut. Pure ease-in
 * starts at zero velocity and reads as lag. Shared by WAAPI and WebGL.
 */
const PUSH_CURVE = [0.3, 0.1, 0.8, 0.4] as const;

export const easing = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  in: "cubic-bezier(0.55, 0, 0.9, 0.3)",
  mechanical: "cubic-bezier(0.3, 0, 0.1, 1)",
  push: `cubic-bezier(${PUSH_CURVE.join(", ")})`,
} as const;

export const duration = {
  instant: 90,
  quick: 180,
  base: 320,
  slow: 640,
  reveal: 1100,
} as const;

/**
 * ENTER THE CLUB — one continuous shot.
 *
 *   0 ─────────── push ──────────── cut ─ hold ─── flash decay ───
 *   disc spins up, composition        │  white exposure hides the
 *   dollies toward the disc,          │  re-framing; the same disc
 *   title overshoots the viewport     │  settles into the manifesto
 */
export const enterTimeline = {
  push: 900,
  flashRise: 120,
  flashHold: 70,
  flashDecay: 700,
  /** Disc travels from the close-up into its manifesto position. */
  settle: 1500,
  /** Manifesto begins revealing this long after the cut. */
  revealDelay: 140,
  lineStagger: 110,
  /** Reduced motion: opacity-only dissolve through the night surface. */
  dissolveIn: 160,
  dissolveOut: 200,
} as const;

/** Ambient behaviour — stillness is part of the aesthetic. */
export const ambient = {
  /** One full 360° turn of the disc, in seconds. */
  yawPeriod: 38,
  /** Peak spin (revolutions / second) when the disc "spins up" on enter.
   *  Kept below the rate where the printed label starts to strobe. */
  spinUpRate: 2.2,
  /** Pointer damping (per second). Higher = snappier. */
  pointerDamping: 3.2,
  /** DOM parallax travel, px at depth 1. */
  parallax: 10,
} as const;

/**
 * ARCHIVE DECK (SC-AU/02) — a machine working, not a shot. Contained,
 * precise, with weight: every leg ends on a physical stop.
 */
export const deckTimeline = {
  /** The catalogue card set aside / put back over the deck. */
  cardTravel: 560,
  /** The disc waits for the card to clear the slot. */
  entryDelay: 260,
  /** Placed at the slot's mouth. */
  entry: 520,
  /** The mechanism takes it: a beat, then the pull onto the spindle. */
  pullPause: 140,
  pull: 720,
  /** Reading the table of contents. */
  spinUp: 700,
  read: 1800,
  /** One revolution while reading (~21 rpm: a working speed, not a show). */
  revolution: 2800,
  /** Coast to rest on READY; a short brake before an eject. */
  spinDown: 1100,
  brake: 280,
  /** LCD lines printing as segments. */
  printStagger: 90,
  eject: 620,
  /** The ejected disc stands in the slot before it goes back to its case. */
  ejectHold: 800,
  lift: 380,
  /** Reduced motion: state changes as short opacity fades and holds. */
  fade: 180,
  hold: 500,
} as const;

export const deckEasing = {
  /** Card sliding on the table. */
  travel: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Motor pull / push: gets going, then decelerates into a stop. */
  motor: "cubic-bezier(0.45, 0, 0.15, 1)",
  eject: "cubic-bezier(0.2, 0.65, 0.2, 1)",
  /** Constant angular acceleration from rest (quadratic ease-in). */
  spinUp: "cubic-bezier(0.333, 0, 0.667, 0.333)",
  /** Constant deceleration to rest (quadratic ease-out): starts at the running speed. */
  spinDown: "cubic-bezier(0.333, 0.667, 0.667, 1)",
} as const;

// ---------------------------------------------------------------- curves (JS)

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInCubic = (t: number) => t * t * t;
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** CSS cubic-bezier as a JS function (Newton–Raphson on x, bisection fallback). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 6; i++) {
      const err = sx(u) - x;
      const d = dx(u);
      if (Math.abs(err) < 1e-5) return sy(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 20; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return sy(u);
  };
}

/** Same curve as `easing.push`, for the WebGL side of the shot. */
export const pushCurve = cubicBezier(...PUSH_CURVE);

export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/** Frame-rate independent exponential damping. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
