"use client";

import { useRef, type PointerEvent } from "react";
import { experience } from "../store";
import styles from "./disc.module.css";

/** ~1 full turn per 900 px of travel: weighted, not twitchy. */
const RAD_PER_PX = (Math.PI * 2) / 900;
/** Release velocity is averaged over this window. */
const SAMPLE_WINDOW_MS = 50;
/** Samples older than this at release mean the hand had stopped. */
const STALE_MS = 80;

type Props = {
  name: "hero" | "manifesto" | "sound";
  className?: string;
  /** Horizontal drag rotates the disc (yaw). Vertical movement still scrolls. */
  rotatable?: boolean;
};

/**
 * A slot in the editorial layout that the WebGL disc is drawn into.
 *
 * - Its box is the single source of truth for disc position/size (CSS owns layout).
 * - It renders a CSS poster disc: first paint, loading state and no-WebGL fallback.
 * - Optionally a drag surface ([ ROTATE ]).
 */
export function DiscAnchor({ name, className, rotatable = false }: Props) {
  // The pointer that owns the drag; extra pointers are ignored until release.
  const owner = useRef<number | null>(null);
  // Recent samples (clientX, timeStamp) for a stable release velocity.
  const samples = useRef<{ x: number; t: number }[]>([]);
  const lastX = useRef(0);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!rotatable || e.button !== 0 || owner.current !== null || experience.enter.locked) return;
    owner.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    experience.drag.active = true;
    lastX.current = e.clientX;
    samples.current = [{ x: e.clientX, t: e.timeStamp }];
    experience.invalidate();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== owner.current || experience.enter.locked) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    experience.drag.delta += dx * RAD_PER_PX;

    const buf = samples.current;
    buf.push({ x: e.clientX, t: e.timeStamp });
    while (buf.length > 2 && e.timeStamp - buf[0].t > SAMPLE_WINDOW_MS) buf.shift();
    experience.invalidate();
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== owner.current) return;
    owner.current = null;
    experience.drag.active = false;
    // Released during ENTER: the gesture was already cancelled — no fling.
    if (experience.enter.locked) {
      samples.current = [];
      return;
    }

    // Average velocity over the last ~50 ms of movement. A hand that stopped
    // before letting go (last sample older than 80 ms) releases with no spin.
    const buf = samples.current.filter((s) => e.timeStamp - s.t <= SAMPLE_WINDOW_MS + STALE_MS);
    const first = buf[0];
    const last = buf[buf.length - 1];
    let v = 0;
    if (first && last && last !== first && e.timeStamp - last.t < STALE_MS) {
      const span = Math.max(8, last.t - first.t) / 1000;
      v = ((last.x - first.x) * RAD_PER_PX) / span;
    }
    samples.current = [];
    experience.drag.velocity = Math.max(-6, Math.min(6, v));
    experience.invalidate();
  };

  return (
    <div
      className={[styles.anchor, rotatable && styles.rotatable, className].filter(Boolean).join(" ")}
      data-disc-anchor={name}
      data-cursor={rotatable ? "rotate" : undefined}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className={styles.poster} />
    </div>
  );
}
