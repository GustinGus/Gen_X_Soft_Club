import { deckEasing as ease, deckTimeline as t } from "@/motion/tokens";
import styles from "./DeckFlight.module.css";

/** How far above the slot's top edge the disc is set down / taken up, in % of
 *  the deck's width: clear of the mouth, and of the shade its lip casts on a
 *  disc going in. (ArchiveDeck.module.css gives the protrusion this headroom.) */
const CLEARANCE = 6;

export type Flight = {
  animation: Animation;
  /** Where the disc is handed over, above its pose in the slot: `--slide` for the deck's views (cqi). Re-read after a layout change. */
  readonly mouth: number;
  /** The flight is over: the flying disc goes (the deck has it, or it is back behind the case). */
  land(): void;
  /** Overtaken: nothing of the flight stays. */
  cancel(): void;
  /** Back to the case from wherever it is now — position, scale, shadow — in about the time it took to get there. */
  turnBack(): Animation;
  /** Set down, it fades out over the deck's model fading in (the model's cycle). */
  fadeOut(duration: number): Animation;
};

/**
 * What lays the flight: the deck's standing view, the class it wears in the
 * model's cycle (only its motion and shade shown), and how far above the
 * plate the disc is handed over (cqi). The model's cycle hands it over right
 * at the slot's mouth (0): the model's canvas reaches only a disc's height
 * above the plate.
 */
export type Standing = { disc: HTMLElement; ghost?: string; clearance?: number };

/** Most of the case's tray is on screen: the disc can be seen leaving it, or going back. */
const inView = (r: DOMRect) => {
  const w = Math.max(0, Math.min(r.right, window.innerWidth) - Math.max(r.left, 0));
  const h = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
  return r.width > 0 && w * h >= 0.5 * r.width * r.height;
};

const homeOf = (deck: HTMLElement) => deck.closest("article")?.querySelector<HTMLElement>("[data-disc-home]") ?? null;

/** The case the record's disc belongs to is on screen. */
export function caseInView(deck: HTMLElement) {
  const home = homeOf(deck);
  return !!home && inView(home.getBoundingClientRect());
}

/**
 * Where the disc is handed over between the deck and a flight: `disc`'s pose
 * for the state, raised until its lower edge is CLEARANCE above the plate
 * (cqi). `disc` is the deck's view standing out of the slot.
 */
export function mouthOf(deck: HTMLElement, disc: HTMLElement, clearance = CLEARANCE) {
  const plate = disc.parentElement?.parentElement; // the protrusion's plate
  if (!plate) return 0;
  const cqi = deck.getBoundingClientRect().width / 100;
  return (disc.getBoundingClientRect().bottom - plate.getBoundingClientRect().top) / cqi + clearance;
}

/**
 * A copy of the deck's standing view of the disc, laid on the file at the
 * hand-over point above the slot: the same picture as the deck's own there.
 * `raised` — the view is already at that point (taken up), not in its pose.
 */
function lay(deck: HTMLElement, { disc, ghost, clearance }: Standing, raised: number) {
  const sheet = deck.closest("article");
  const home = homeOf(deck);
  if (!sheet || !home) return null;
  const from = home.getBoundingClientRect();
  if (!inView(from)) return null;

  const box = sheet.getBoundingClientRect();
  const at = deck.getBoundingClientRect();
  const cqi = at.width / 100;
  const slot = disc.getBoundingClientRect();
  const mouth = raised || mouthOf(deck, disc, clearance);
  const left = slot.left - at.left;
  const top = slot.top - at.top - (raised ? 0 : mouth * cqi);

  const layer = document.createElement("div");
  layer.className = styles.flight;
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.deckFlight = "";
  Object.assign(layer.style, { left: `${at.left - box.left}px`, top: `${at.top - box.top}px`, width: `${at.width}px` });

  // The picture the posters show in the slot (in the model's cycle the
  // deck's view only lends its motion, so it is read without that).
  const ghosted = !!ghost && disc.classList.contains(ghost);
  if (ghosted) disc.classList.remove(ghost);
  const filter = getComputedStyle(disc).filter;
  if (ghosted) disc.classList.add(ghost);

  const face = disc.cloneNode(true) as HTMLElement;
  face.removeAttribute("data-deck-disc");
  if (ghost) face.classList.remove(ghost);
  Object.assign(face.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${slot.width}px`,
    // the contact shadow it has in the slot, so it is the same picture there
    filter,
    transformOrigin: "0 0",
  });
  const air = document.createElement("span");
  air.className = styles.air;
  face.prepend(air);
  layer.append(face);
  sheet.append(layer);

  // The case's tray, as a transform of the disc at the hand-over point.
  const tray: Home = { x: from.left - (at.left + left), y: from.top - (at.top + top), scale: from.width / slot.width };
  return { layer, face, air, mouth, home: tray, deck, standing: { disc, ghost, clearance } };
}

/** The case's tray, as a translate and scale of the disc at the hand-over point. */
type Home = { x: number; y: number; scale: number };

/**
 * Where a flight has the disc: 0 at the case's tray, 1 at the hand-over point
 * above the slot. Every move of a flight runs between two of these, so it can
 * be re-aimed at a new layout without losing its place.
 */
const point = ({ x, y, scale }: Home, u: number) =>
  `translate(${(1 - u) * x}px, ${(1 - u) * y}px) scale(${1 + (1 - u) * (scale - 1)})`;

/** The point along the flight a computed transform is at (see `point`). */
const along = (home: Home, transform: string) => {
  if (transform === "none") return 1;
  const m = new DOMMatrixReadOnly(transform);
  if (Math.abs(home.scale - 1) > 1e-3) return 1 - (m.a - 1) / (home.scale - 1);
  return Math.abs(home.x) > Math.abs(home.y) ? 1 - m.e / home.x : home.y ? 1 - m.f / home.y : 1;
};

/** A deck view's translate along y, in px (its own motion, on top of its pose). */
const shiftOf = (el: HTMLElement) => {
  const value = getComputedStyle(el).translate;
  return value === "none" ? 0 : parseFloat(value.split(" ")[1] ?? "0") || 0;
};

/**
 * The layout has changed under a flight (a window resized, a device turned):
 * the deck, the slot and the case are measured again where they are now, and
 * the flight goes on from the same point of its way between them. Null when
 * the deck or its case is gone.
 */
function relay(laid: NonNullable<ReturnType<typeof lay>>) {
  const { layer, face, deck, standing } = laid;
  const sheet = deck.closest("article");
  const home = homeOf(deck);
  const plate = standing.disc.parentElement?.parentElement;
  if (!sheet || !home || !plate) return null;
  const from = home.getBoundingClientRect();
  const box = sheet.getBoundingClientRect();
  const deckAt = deck.getBoundingClientRect();
  const cqi = deckAt.width / 100;
  const slot = standing.disc.getBoundingClientRect();
  // its pose in the slot (whatever the deck's views are doing), raised to the hand-over point
  const pose = slot.top - shiftOf(standing.disc);
  const mouth = (pose + slot.height - plate.getBoundingClientRect().top) / cqi + (standing.clearance ?? CLEARANCE);
  const left = slot.left - deckAt.left;
  const top = pose - deckAt.top - mouth * cqi;
  Object.assign(layer.style, { left: `${deckAt.left - box.left}px`, top: `${deckAt.top - box.top}px`, width: `${deckAt.width}px` });
  Object.assign(face.style, { left: `${left}px`, top: `${top}px`, width: `${slot.width}px` });
  return {
    mouth,
    home: { x: from.left - (deckAt.left + left), y: from.top - (deckAt.top + top), scale: from.width / slot.width },
  };
}

/** The lift's shadow over a flight: none at either end, the disc held up in between. */
const LIFT = [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }];

/** A flight's moves: `face` carried from one point of its way to another (see `point`). */
function carry(face: HTMLElement, home: Home, from: number, to: number, options: KeyframeAnimationOptions) {
  const animation = face.animate([{ transform: point(home, from) }, { transform: point(home, to) }], options);
  return { animation, from, to };
}

function flight(laid: NonNullable<ReturnType<typeof lay>>, move: ReturnType<typeof carry>, lift: Animation, travel: number): Flight {
  const { layer, face, air } = laid;
  let { mouth, home } = laid;
  let current = move;
  let shadow = lift;
  let fade: Animation | null = null;
  // Re-aimed at the new layout, from the same point of its way.
  const resized = () => {
    const now = relay(laid);
    if (!now) return;
    ({ mouth, home } = now);
    const effect = current.animation.effect;
    if (effect instanceof KeyframeEffect)
      effect.setKeyframes([{ transform: point(home, current.from) }, { transform: point(home, current.to) }]);
  };
  window.addEventListener("resize", resized);
  const remove = () => {
    window.removeEventListener("resize", resized);
    layer.remove();
  };
  return {
    get animation() {
      return current.animation;
    },
    get mouth() {
      return mouth;
    },
    land: remove,
    cancel: () => {
      current.animation.cancel();
      shadow.cancel();
      fade?.cancel();
      remove();
    },
    turnBack: () => {
      // where it is now (whatever is running), then nothing running — and
      // whole again if it was fading out over the model: the model goes
      // in the same frame, so one disc stays on screen, not two half ones
      const now = along(home, getComputedStyle(face).transform);
      const held = getComputedStyle(air).opacity;
      const timing = current.animation.effect?.getComputedTiming();
      const gone = Math.min(1, Math.max(0, ((Number(timing?.localTime) || 0) - t.flightDelay) / travel));
      current.animation.cancel();
      shadow.cancel();
      fade?.cancel();
      const duration = Math.max(t.turnBack, gone * travel);
      current = carry(face, home, now, 0, { duration, easing: ease.motor, fill: "both" });
      shadow = air.animate([{ opacity: Number(held) }, { opacity: 0 }], { duration, fill: "both" });
      return current.animation;
    },
    fadeOut: (duration) => {
      fade = face.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: "forwards" });
      return fade;
    },
  };
}

/**
 * THE DISC LEAVING ITS CASE — lifted from the case's tray (from behind the
 * case) and carried across the table to just above the deck's slot, where
 * the deck's views take it over. `disc` is the deck's view standing out of
 * the slot, in its pose for the state.
 *
 * Null when the case is not on screen: a disc must not come from somewhere
 * the reader cannot see.
 */
export function flyFromCase(deck: HTMLElement, standing: Standing): Flight | null {
  const laid = lay(deck, standing, 0);
  if (!laid) return null;
  const timing = { duration: t.flight, delay: t.flightDelay, fill: "both" as const };
  const move = carry(laid.face, laid.home, 0, 1, { ...timing, easing: ease.motor });
  const lift = laid.air.animate(LIFT, timing);
  return flight(laid, move, lift, t.flight);
}

/**
 * THE DISC GOING BACK TO ITS CASE — taken from just above the slot, where
 * the deck's views have raised it to (`mouth`), and carried back behind the
 * case's tray. With `fadeIn` (the model's cycle) it first fades in there over
 * the model fading out, and only then moves. Null when the case is not on screen.
 */
export function flyToCase(deck: HTMLElement, standing: Standing, mouth: number, fadeIn = 0): Flight | null {
  const laid = lay(deck, standing, mouth);
  if (!laid) return null;
  const timing = { duration: t.flight, delay: fadeIn, fill: "both" as const };
  const move = carry(laid.face, laid.home, 1, 0, { ...timing, easing: ease.motor });
  const lift = laid.air.animate(LIFT, timing);
  const made = flight(laid, move, lift, t.flight);
  if (fadeIn) laid.face.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeIn, fill: "backwards" });
  return made;
}
