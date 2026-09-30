"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { deckEasing as ease, deckTimeline as t } from "@/motion/tokens";
import { hasMedia, type DeckEvent, type DeckState } from "./deckMachine";

type Options = {
  deck: RefObject<HTMLElement | null>;
  state: DeckState;
  dispatch: (event: DeckEvent) => void;
  reduced: boolean;
  /** Inspection (?deck=): the state is shown still, nothing runs. */
  still: boolean;
};

type Snapshot = { disc: number | null };

const MOVE = "deck-move";
const SPIN = "deck-spin";
const CUE = "deck-cue";

/** Degrees per millisecond at reading speed. */
const SPEED = 360 / t.revolution;

const cancel = (el: Element, id: string) =>
  el.getAnimations().forEach((a) => {
    if (a.id === id) a.cancel();
  });

const angleOf = (el: Element | null) => {
  const value = el ? getComputedStyle(el).rotate : "none";
  return value === "none" ? 0 : parseFloat(value) || 0;
};

/** A deck custom property in cqi (computed values arrive var()-substituted). */
const cqiOf = (el: Element, name: string) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

/**
 * THE DECK'S SEQUENCE — the motion that carries the machine from state to
 * state, and the events that only the motion can know about.
 *
 *   INSERT ─ card aside ─ disc at the slot ─ pull ─ seat ········ SEATED
 *   READING ─ spin up ─ read the index ──────────────────── RECOGNISED
 *   READY ─ coast to rest ─ LCD prints
 *   EJECT ─ brake ─ push out ─ stand ─ lift toward the case ········ OUT
 *   EMPTY ─ card back over the deck
 *
 * Every automatic event fires on an animation's real `finished`, never on
 * a timer that can drift from what is on screen. Each state change bumps a
 * generation: a sequence that has been overtaken (EJECT during INSERTING)
 * never fires its event. Moves are FLIP: the disc is measured where it is
 * on screen before the event, and animated from there after — so an
 * interrupted insertion reverses from the exact point it had reached.
 *
 * Only transform (translate / rotate) and opacity are animated.
 */
export function useDeckSequence({ deck, state, dispatch, reduced, still }: Options) {
  const generation = useRef(0);
  const previous = useRef(state);
  const snapshot = useRef<Snapshot | null>(null);

  /** The only way events reach the machine: measure first, then dispatch. */
  const send = (event: DeckEvent) => {
    const el = deck.current;
    if (!el) return;
    const disc = el.querySelector('[data-deck-disc="window"]');
    snapshot.current = { disc: disc ? disc.getBoundingClientRect().top : null };
    dispatch(event);
  };

  // The sequence reports through the latest `send` without re-running on it.
  const report = useRef(send);
  useLayoutEffect(() => {
    report.current = send;
  });

  // Unmount: overtake whatever is running and put the table back.
  useEffect(() => {
    const el = deck.current;
    const sequence = generation;
    return () => {
      sequence.current++;
      el?.closest("article")?.removeAttribute("data-deck");
    };
  }, [deck]);

  useLayoutEffect(() => {
    const el = deck.current;
    const article = el?.closest("article");
    if (!el || !article) return;

    const from = previous.current;
    const first = snapshot.current;
    previous.current = state;
    snapshot.current = null;

    // Same state (first paint, a preference changing): show it, and leave
    // whatever sequence is running alone.
    if (from === state) {
      article.setAttribute("data-deck", state);
      return;
    }

    // Only a real event animates; inspection just shows the state.
    const animate = !still && first !== null;
    const run = ++generation.current;
    const alive = () => generation.current === run;
    const then = (animation: Animation, next: () => void) =>
      animation.finished.then(() => alive() && next()).catch(() => {});

    // ------------------------------------------------------------ the table
    const card = article.querySelector<HTMLElement>('[data-vt="catalogue-card"]');
    const moveCard = animate && card && hasMedia(from) !== hasMedia(state);
    const cardFirst = moveCard && card ? { box: card.getBoundingClientRect(), angle: angleOf(card) } : null;
    const deckTop = el.getBoundingClientRect().top;

    article.setAttribute("data-deck", state);

    // The page may grow or shrink around the deck (mobile): hold the deck
    // still on screen, so the machine never jumps under the user's hand.
    if (animate) {
      const shift = el.getBoundingClientRect().top - deckTop;
      if (Math.abs(shift) > 0.5) window.scrollBy({ top: shift, behavior: "instant" });
    }

    if (card && cardFirst) {
      cancel(card, MOVE);
      const box = card.getBoundingClientRect();
      const dx = cardFirst.box.left + cardFirst.box.width / 2 - (box.left + box.width / 2);
      const dy = cardFirst.box.top + cardFirst.box.height / 2 - (box.top + box.height / 2);
      card.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { translate: `${dx}px ${dy}px`, rotate: `${cardFirst.angle}deg` },
              { translate: "0 0", rotate: `${angleOf(card)}deg` },
            ],
        { id: MOVE, duration: reduced ? t.fade : t.cardTravel, easing: ease.travel },
      );
    }

    if (!animate) return;

    // ------------------------------------------------------------ the disc
    const discs = [...el.querySelectorAll<HTMLElement>("[data-deck-disc]")];
    const window_ = el.querySelector<HTMLElement>('[data-deck-disc="window"]');
    const prints = () => [...el.querySelectorAll<HTMLElement>("[data-disc-print]")];
    const cqi = el.clientWidth / 100;
    const lcd = (name: string) => el.querySelector<HTMLElement>(`[data-lcd="${name}"]`);

    discs.forEach((d) => cancel(d, MOVE));
    // The previous state's LCD cues end with it.
    el.querySelectorAll("[data-lcd]").forEach((segment) => cancel(segment, CUE));

    /** Every view of the disc makes the same move (they are one object). */
    const move = (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const animations = discs.map((d) => d.animate(keyframes, { id: MOVE, fill: "forwards", ...options }));
      return animations[0];
    };

    /** Turn the print from where it is; `commit` leaves it at rest there. */
    const turn = (to: (at: number) => number, options: KeyframeAnimationOptions, commit: boolean) => {
      const at = angleOf(window_?.querySelector("[data-disc-print]") ?? null);
      const end = to(at);
      const animations = prints().map((p) => {
        cancel(p, SPIN);
        p.style.rotate = `${at}deg`;
        return p.animate([{ rotate: `${at}deg` }, { rotate: `${end}deg` }], { id: SPIN, ...options });
      });
      if (commit) {
        animations[0]?.finished
          .then(() =>
            prints().forEach((p) => {
              p.style.rotate = `${end % 360}deg`;
              cancel(p, SPIN);
            }),
          )
          .catch(() => {});
      }
      return animations[0];
    };

    /** Coast (or brake) to rest from reading speed: constant deceleration. */
    const stop = (duration: number) => {
      if (reduced) return;
      turn((at) => at + (SPEED * duration) / 2, { duration, easing: ease.spinDown, fill: "forwards" }, true);
    };

    if (from === "empty" && state === "inserting") {
      prints().forEach((p) => (p.style.rotate = "0deg"));
      const placed = reduced
        ? move([{ opacity: 0 }, { opacity: 1 }], { duration: t.fade })
        : move(
            [
              { translate: `0 ${-6 * cqi}px`, opacity: 0 },
              { opacity: 1, offset: 0.3 },
              { translate: "0 0", opacity: 1 },
            ],
            { duration: t.entry, delay: t.entryDelay, easing: ease.travel, fill: "both" },
          );
      then(placed, () => {
        // read below the plate: the narrow plate redefines both there
        const probe = window_ ?? el;
        const seat = (cqiOf(probe, "--seat-y") - cqiOf(probe, "--disc-y")) * cqi;
        const pulled = reduced
          ? move([{ opacity: 1 }, { opacity: 1 }], { duration: t.hold })
          : move(
              [
                { translate: "0 0", easing: ease.motor },
                // the clamp takes it a hair past the spindle, then it sits
                { translate: `0 ${seat + 0.3 * cqi}px`, offset: 0.9, easing: "ease-in-out" },
                { translate: `0 ${seat}px` },
              ],
              { duration: t.pull, delay: t.pullPause },
            );
        then(pulled, () => report.current({ type: "SEATED" }));
      });
      return;
    }

    // FLIP: from where the disc was on screen to its new place.
    const last = window_?.getBoundingClientRect().top ?? null;
    const delta = first.disc !== null && last !== null ? first.disc - last : 0;

    if (state === "reading") {
      // Seated by the pull, so normally nothing is left to cover; reduced
      // motion never pulled, and shows the disc in its seat with a fade.
      if (reduced) move([{ opacity: 0 }, { opacity: 1 }], { duration: t.fade });
      else if (Math.abs(delta) > 0.5) move([{ translate: `0 ${delta}px` }, { translate: "0 0" }], { duration: t.fade });
      const read = lcd("read");
      if (!reduced) {
        const up = turn((at) => at + (SPEED * t.spinUp) / 2, { duration: t.spinUp, easing: ease.spinUp, fill: "forwards" }, false);
        then(up, () => turn((at) => at + 360, { duration: t.revolution, iterations: Infinity }, false));
        lcd("cursor")?.animate(
          [{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }],
          { id: CUE, duration: 1060, iterations: Infinity },
        );
      }
      if (read) {
        // The READ segment blinks while the index is read; its end is the recognition.
        const cue = read.animate(
          reduced
            ? [{ opacity: 1 }, { opacity: 1 }]
            : [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0.15, offset: 0.6 }, { opacity: 0.15 }],
          { id: CUE, duration: reduced ? t.read : t.read / 4, iterations: reduced ? 1 : 4 },
        );
        then(cue, () => report.current({ type: "RECOGNISED" }));
      }
      return;
    }

    if (state === "ready") {
      stop(t.spinDown);
      if (!reduced) {
        el.querySelectorAll<HTMLElement>("[data-lcd-print]").forEach((line, i) =>
          line.animate([{ opacity: 0 }, { opacity: 1 }], {
            id: CUE,
            duration: 1,
            delay: t.printStagger * (i + 1),
            fill: "backwards",
          }),
        );
      }
      return;
    }

    if (state === "ejecting") {
      // A disc still turning is braked before it is pushed out.
      if (from === "reading") stop(t.brake);
      else {
        const at = angleOf(window_?.querySelector("[data-disc-print]") ?? null);
        prints().forEach((p) => (p.style.rotate = `${at}deg`));
      }
      const out = reduced
        ? move([{ opacity: 0 }, { opacity: 1 }], { duration: t.fade })
        : move([{ translate: `0 ${delta}px` }, { translate: "0 0" }], { duration: t.eject, easing: ease.eject });
      then(out, () => {
        const lifted = move(
          reduced
            ? [{ opacity: 1 }, { opacity: 0 }]
            : [
                { translate: "0 0", opacity: 1 },
                { translate: `0 ${-5 * cqi}px`, opacity: 0 },
              ],
          { duration: reduced ? t.fade : t.lift, delay: t.ejectHold, easing: "cubic-bezier(0.55, 0, 0.9, 0.3)" },
        );
        then(lifted, () => report.current({ type: "OUT" }));
      });
    }
  }, [deck, state, still, reduced]);

  return send;
}
