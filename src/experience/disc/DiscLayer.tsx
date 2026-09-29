"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { supportsWebGL } from "@/lib/webgl";
import { useMediaQuery, useReducedMotion } from "@/motion/useMediaQuery";
import { experience, measureAnchor } from "../store";
import styles from "./disc.module.css";

const DiscCanvas = dynamic(() => import("./DiscCanvas"), { ssr: false });

/** Re-measures the DOM anchors the WebGL disc is choreographed against. */
function useAnchorMeasurement() {
  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector("[data-disc-anchor='hero']");
      const manifesto = document.querySelector("[data-disc-anchor='manifesto']");
      const section = document.getElementById("manifesto");
      experience.anchors.hero = hero ? measureAnchor(hero) : null;
      experience.anchors.manifesto = manifesto ? measureAnchor(manifesto) : null;
      if (section) {
        const r = section.getBoundingClientRect();
        experience.anchors.manifestoTop = r.top + window.scrollY;
        experience.anchors.manifestoBottom = r.bottom + window.scrollY;
      }
      experience.invalidate();
    };

    measure();
    document.fonts.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
}

/**
 * Fixed WebGL layer that sits *between* the typographic layers (z: --z-disc).
 * Until it is ready — or if WebGL is unavailable — the CSS poster discs
 * inside each DiscAnchor carry the composition.
 */
export function DiscLayer() {
  const reducedMotion = useReducedMotion();
  const coarse = useMediaQuery("(pointer: coarse)");
  const [mount, setMount] = useState(false);

  useAnchorMeasurement();

  useEffect(() => {
    experience.reducedMotion = reducedMotion;
    experience.invalidate();
  }, [reducedMotion]);

  // Defer the three.js chunk until the browser is idle after first paint.
  useEffect(() => {
    if (!supportsWebGL()) return;
    const start = () => setMount(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 200);
    return () => clearTimeout(id);
  }, []);

  const onReady = useCallback(() => {
    document.documentElement.dataset.disc = "webgl";
  }, []);

  useEffect(() => () => void delete document.documentElement.dataset.disc, []);

  if (!mount) return null;

  return (
    <div className={styles.layer} aria-hidden="true">
      <DiscCanvas reducedMotion={reducedMotion} coarse={coarse} onReady={onReady} />
    </div>
  );
}
