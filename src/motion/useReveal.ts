"use client";

import { useEffect, type RefObject } from "react";

/**
 * Editorial reveal for a section, driven by one IntersectionObserver.
 *
 * Owns `data-reveal` on the element, set directly on the DOM (no re-render):
 *   absent   → server / no-JS: fully visible
 *   pending  → below the fold at mount, waiting to be reached
 *   revealed → CSS plays the section's reveal (transform/opacity only)
 *
 * Content that is already on screen at mount is never hidden.
 * Reduced motion: base.css collapses the transitions — state changes only.
 */
export function useReveal(target: RefObject<HTMLElement | null>, threshold = 0.2) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.85) el.setAttribute("data-reveal", "pending");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-reveal", "revealed");
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, threshold]);
}
