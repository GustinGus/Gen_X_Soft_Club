"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. Server snapshot is `fallback`, so markup is
 * deterministic and the client corrects itself after hydration.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** A precise pointer that can hover: mouse / trackpad / stylus with hover. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION);
export const useFinePointer = () => useMediaQuery(FINE_POINTER);
