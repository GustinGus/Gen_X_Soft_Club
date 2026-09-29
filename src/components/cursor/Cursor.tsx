"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/motion/tokens";
import { useFinePointer, useReducedMotion } from "@/motion/useMediaQuery";
import styles from "./Cursor.module.css";

/**
 * Dispatch on `window` to drop contextual state instantly (e.g. on a scene cut).
 * Optional `detail: { only: string[] }` limits the reset to those states.
 */
export const CURSOR_RESET_EVENT = "softclub:cursor-reset";

/** Contextual states. Elements opt in with `data-cursor="<state>"`. */
const LABELS: Record<string, string> = {
  enter: "Enter",
  rotate: "Rotate",
  view: "View",
  drag: "Drag",
  listen: "Listen",
};

/**
 * Camera focus marker. The centre point is locked to the pointer (no lag on
 * the thing that clicks); only the focus brackets trail, very slightly, to
 * give the marker weight. Fine pointers only; hidden on touch.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const fr = frame.current;
    const lb = label.current;
    if (!fine || !el || !fr || !lb) return;

    const html = document.documentElement;
    html.dataset.cursor = "custom";

    let x = -100;
    let y = -100;
    let fx = x;
    let fy = y;
    let raf = 0;
    let last = 0;
    let seen = false;

    const render = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
      last = now;
      fx = reduced ? x : damp(fx, x, 30, dt);
      fy = reduced ? y : damp(fy, y, 30, dt);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      fr.style.transform = `translate3d(${fx - x}px, ${fy - y}px, 0)`;
      if (Math.abs(fx - x) > 0.1 || Math.abs(fy - y) > 0.1) raf = requestAnimationFrame(render);
      else {
        raf = 0;
        last = 0;
      }
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        fx = x;
        fy = y;
        el.dataset.visible = "true";
      }
      wake();
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      const state = target?.getAttribute("data-cursor") ?? "";
      const text = LABELS[state];
      el.dataset.state = text ? state : "idle";
      lb.textContent = text ?? "";
    };

    // Scene cut: the element under the pointer changed without a pointerover.
    // Snap to idle with transitions suppressed for one frame, so a stale
    // label (e.g. [ ENTER ]) is never seen over the new scene.
    let snapRaf = 0;
    const onReset = (e: Event) => {
      const only = (e as CustomEvent<{ only?: string[] } | null>).detail?.only;
      if (only && !only.includes(el.dataset.state ?? "")) return;
      el.dataset.snap = "true";
      el.dataset.state = "idle";
      delete el.dataset.pressed;
      lb.textContent = "";
      cancelAnimationFrame(snapRaf);
      snapRaf = requestAnimationFrame(() => {
        snapRaf = requestAnimationFrame(() => delete el.dataset.snap);
      });
    };

    const onDown = () => (el.dataset.pressed = "true");
    const onUp = () => delete el.dataset.pressed;
    const onLeave = () => {
      el.dataset.visible = "false";
      seen = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    window.addEventListener(CURSOR_RESET_EVENT, onReset);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(snapRaf);
      window.removeEventListener(CURSOR_RESET_EVENT, onReset);
      delete html.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  return (
    <div ref={root} className={styles.cursor} data-state="idle" data-visible="false" aria-hidden="true">
      <div ref={frame} className={styles.frame}>
        <span className={styles.bracket} data-corner="tl" />
        <span className={styles.bracket} data-corner="tr" />
        <span className={styles.bracket} data-corner="bl" />
        <span className={styles.bracket} data-corner="br" />
      </div>
      <span className={styles.point} />
      <span className={styles.label}>
        <span className={styles.bracketText}>[</span>
        <span ref={label} />
        <span className={styles.bracketText}>]</span>
      </span>
    </div>
  );
}
