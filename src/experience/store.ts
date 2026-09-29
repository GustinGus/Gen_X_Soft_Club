/**
 * Shared, mutable experience state.
 *
 * Read every frame by the WebGL layer and written by DOM event handlers.
 * Lives outside React on purpose: per-frame values must never trigger renders.
 */

export type Rect = { x: number; y: number; size: number };

type ExperienceState = {
  /** Normalised pointer, -1..1 from viewport centre. Raw target, undamped. */
  pointer: { x: number; y: number };
  /** Disc anchors in *document* coordinates (px). Measured from the DOM. */
  anchors: {
    hero: Rect | null;
    manifesto: Rect | null;
    /** Document y where the manifesto section starts; scroll progress 0→1 ends here. */
    manifestoTop: number;
    /** Document y where the manifesto section ends; past it the disc layer can sleep. */
    manifestoBottom: number;
  };
  /** Horizontal drag on the disc (yaw), radians per second of release inertia. */
  drag: { active: boolean; delta: number; velocity: number };
  /** Cinematic ENTER shot. Timestamps from performance.now(), null when idle. */
  enter: {
    pushStart: number | null;
    cutAt: number | null;
    /** Viewport-space focal point of the dolly (the disc's centre at click time). */
    focal: { x: number; y: number } | null;
    /** True for the whole ENTER sequence: manual disc interaction is off. */
    locked: boolean;
    /** Pointer frozen at click time; the disc reads this instead of the live pointer. */
    pointer: { x: number; y: number } | null;
  };
  reducedMotion: boolean;
  /** User paused ambient motion (WCAG 2.2.2 — pause, stop, hide). */
  motionPaused: boolean;
  /** Dev-only slow motion for inspecting choreography (1 = real time). */
  timeScale: number;
  /** Set by the canvas once mounted; lets DOM code request a frame on demand. */
  invalidate: () => void;
};

export const experience: ExperienceState = {
  pointer: { x: 0, y: 0 },
  anchors: { hero: null, manifesto: null, manifestoTop: 1, manifestoBottom: Infinity },
  drag: { active: false, delta: 0, velocity: 0 },
  enter: { pushStart: null, cutAt: null, focal: null, locked: false, pointer: null },
  reducedMotion: false,
  motionPaused: false,
  timeScale: 1,
  invalidate: () => {},
};

/** Scales a choreography duration by the dev time scale. */
export const scaled = (ms: number) => ms / experience.timeScale;

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  // Inspect / slow down from DevTools:  __softclub.timeScale = 0.1
  (window as unknown as { __softclub: ExperienceState }).__softclub = experience;
}

/** Document-space rect of an element, as a square anchor (centre + size). */
export function measureAnchor(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 + window.scrollX,
    y: r.top + r.height / 2 + window.scrollY,
    size: Math.min(r.width, r.height),
  };
}
