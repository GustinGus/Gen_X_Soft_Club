"use client";

import { useEffect, type RefObject } from "react";
import { experience } from "@/experience/store";
import { ambient, damp } from "./tokens";

type Layer = { el: HTMLElement; depth: number };

/**
 * One pointer listener for the whole experience. Writes the normalised,
 * undamped pointer into the shared store (read by WebGL each frame) and
 * drives a damped DOM parallax on the layers inside `target` marked
 * `data-parallax`.
 *
 * Each layer's `translate` is written directly (no custom property on the
 * parent → no subtree style recalc):
 *   x = px × --depth × --parallax-travel
 *   y = py × --depth × --parallax-travel × 0.6
 * `--depth` (per layer) and `--parallax-travel` (per breakpoint) are read
 * from CSS once, and again on resize.
 *
 * The rAF loop only runs while values are settling — a still pointer costs nothing.
 */
export function usePointerField(target: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = target.current;
    if (!root) return;

    let layers: Layer[] = [];
    let travel = 0;

    const measure = () => {
      travel = parseFloat(getComputedStyle(root).getPropertyValue("--parallax-travel")) || 0;
      layers = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
        el,
        depth: parseFloat(getComputedStyle(el).getPropertyValue("--depth")) || 0,
      }));
    };

    const write = (px: number, py: number) => {
      for (const { el, depth } of layers) {
        const x = px * depth * travel;
        const y = py * depth * travel * 0.6;
        el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      }
    };

    measure();

    if (!enabled) {
      experience.pointer.x = 0;
      experience.pointer.y = 0;
      for (const { el } of layers) el.style.translate = "";
      return;
    }

    let px = 0;
    let py = 0;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
      last = now;
      const tx = experience.pointer.x;
      const ty = experience.pointer.y;
      px = damp(px, tx, ambient.pointerDamping, dt);
      py = damp(py, ty, ambient.pointerDamping, dt);
      write(px, py);
      if (Math.abs(px - tx) > 0.0005 || Math.abs(py - ty) > 0.0005) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      experience.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      experience.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };

    const onLeave = () => {
      experience.pointer.x = 0;
      experience.pointer.y = 0;
      wake();
    };

    const onResize = () => {
      measure();
      write(px, py);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      for (const { el } of layers) el.style.translate = "";
    };
  }, [target, enabled]);
}
