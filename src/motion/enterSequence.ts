import { experience, scaled } from "@/experience/store";
import { duration, easing, enterTimeline } from "./tokens";

type Options = {
  /** The lobby section; elements marked `data-shot` are choreographed. */
  stage: HTMLElement;
  /** Full-viewport exposure layer. */
  flash: HTMLElement;
  /** Re-frame under the flash: scroll to the manifesto, start its reveal. */
  onCut: () => void;
  reducedMotion: boolean;
};

/**
 * ENTER THE CLUB — a single continuous shot, not fade-out → blank → fade-in.
 *
 *  1. the disc spins up and the camera pushes toward it       (WebGL, shared clock)
 *  2. the whole composition scales around the disc's centre  (a dolly, in DOM)
 *     front type scales more than back type → real depth
 *  3. secondary objects slide past the lens and out of frame
 *  4. a short photographic flash peaks exactly at the cut
 *  5. under the exposure, the page re-frames onto the manifesto
 *  6. the exposure decays while the same disc settles into its new place
 */
export async function runEnterSequence(options: Options) {
  lockDiscInteraction();
  try {
    if (options.reducedMotion) {
      // No push, no flash, no spatial motion: an opacity-only dissolve
      // through the night surface, so light → dark is never a hard cut.
      await dissolve(options.flash, options.onCut);
      return;
    }
    await runShot(options);
  } finally {
    unlockDiscInteraction();
  }
}

/**
 * From the first instant of ENTER, the disc is automation-only:
 * no new drags (DOM: pointer-events off via `html[data-enter]`; JS: guard in
 * DiscAnchor), any drag/fling in progress is dropped, and the pointer the disc
 * reads is frozen at its click-time value.
 */
function lockDiscInteraction() {
  experience.enter.locked = true;
  experience.enter.pointer = { ...experience.pointer };
  experience.drag.active = false;
  experience.drag.delta = 0;
  experience.drag.velocity = 0;
  document.documentElement.dataset.enter = "active";
}

function unlockDiscInteraction() {
  experience.enter.locked = false;
  delete document.documentElement.dataset.enter;
}

async function runShot({ stage, flash, onCut }: Options) {
  const running: Animation[] = [];

  // Focal point = the disc, in viewport space. Shared with WebGL so the
  // type dolly and the disc close-up converge on one centre (one camera).
  const anchor = experience.anchors.hero;
  const fx = anchor ? anchor.x - window.scrollX : window.innerWidth * 0.6;
  const fy = anchor ? anchor.y - window.scrollY : window.innerHeight * 0.5;

  experience.enter.focal = { x: fx, y: fy };
  experience.enter.pushStart = performance.now();
  experience.enter.cutAt = null;
  experience.invalidate();

  const push: KeyframeAnimationOptions = {
    duration: scaled(enterTimeline.push),
    easing: easing.push,
    fill: "forwards",
  };

  const dolly = (el: HTMLElement, scale: number) => {
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = `${fx - r.left}px ${fy - r.top}px`;
    running.push(el.animate([{ transform: "scale(1)" }, { transform: `scale(${scale})` }], push));
  };

  const passLens = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - fx;
    const dy = r.top + r.height / 2 - fy;
    running.push(
      el.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.9}px, ${dy * 0.9}px) scale(1.6)`, opacity: 0 },
        ],
        { ...push, duration: scaled(enterTimeline.push * 0.85) },
      ),
    );
  };

  const recede = (el: HTMLElement, lift: number) => {
    running.push(
      el.animate(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(${lift}px)`, opacity: 0 },
        ],
        { duration: scaled(duration.base * 1.3), easing: easing.out, fill: "forwards" },
      ),
    );
  };

  stage.querySelectorAll<HTMLElement>("[data-shot]").forEach((el) => {
    switch (el.dataset.shot) {
      case "title-back":
        return dolly(el, 2.2);
      case "title-front":
        return dolly(el, 3.3);
      case "object":
        return passLens(el);
      case "chrome":
        return recede(el, -16);
      case "entry":
        return recede(el, 24);
      case "aside":
        return recede(el, 0);
    }
  });

  // Exposure rises so it peaks exactly as the push ends.
  const rise = flash.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: scaled(enterTimeline.flashRise),
    delay: scaled(enterTimeline.push - enterTimeline.flashRise),
    easing: "cubic-bezier(0.2, 0, 0.1, 1)",
    fill: "forwards",
  });

  try {
    await rise.finished;
  } catch {
    // Cancelled (e.g. unmount) — leave everything as it was.
    running.forEach((a) => a.cancel());
    experience.enter.pushStart = null;
    experience.enter.focal = null;
    return;
  }

  // ---- the cut --------------------------------------------------------------
  experience.enter.cutAt = performance.now();
  onCut();
  // The lobby is out of frame now; restore it silently for the way back.
  running.forEach((a) => a.cancel());
  stage.querySelectorAll<HTMLElement>("[data-shot]").forEach((el) => (el.style.transformOrigin = ""));
  experience.invalidate();

  const decay = flash.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: scaled(enterTimeline.flashDecay),
    delay: scaled(enterTimeline.flashHold),
    easing: easing.out,
    fill: "forwards",
  });
  try {
    await decay.finished;
  } finally {
    rise.cancel();
    decay.cancel();
  }
}

/** Reduced-motion ENTER: overlay in (~160ms) → cut → overlay out (~200ms). Opacity only. */
async function dissolve(overlay: HTMLElement, onCut: () => void) {
  overlay.style.background = "var(--surface-night)";
  const fadeIn = overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: scaled(enterTimeline.dissolveIn),
    easing: easing.inOut,
    fill: "forwards",
  });
  try {
    await fadeIn.finished;
  } catch {
    overlay.style.background = "";
    return;
  }

  onCut();

  const fadeOut = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: scaled(enterTimeline.dissolveOut),
    easing: easing.inOut,
    fill: "forwards",
  });
  try {
    await fadeOut.finished;
  } finally {
    fadeIn.cancel();
    fadeOut.cancel();
    overlay.style.background = "";
  }
}
