"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { supportsWebGL } from "@/lib/webgl";
import { useMediaQuery, useReducedMotion } from "@/motion/useMediaQuery";
import { experience, measureAnchor } from "../store";
import { CanvasBoundary } from "./CanvasBoundary";
import styles from "./disc.module.css";

const DiscCanvas = dynamic(() => import("./DiscCanvas"), { ssr: false });

/** Re-measures the DOM anchors the WebGL disc is choreographed against. */
function useAnchorMeasurement() {
  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector("[data-disc-anchor='hero']");
      const manifesto = document.querySelector("[data-disc-anchor='manifesto']");
      const sound = document.querySelector("[data-disc-anchor='sound']");
      const manifestoSection = document.getElementById("manifesto");
      const soundSection = document.getElementById("sound");
      const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
      const bottom = (el: Element) => el.getBoundingClientRect().bottom + window.scrollY;

      experience.anchors.hero = hero ? measureAnchor(hero) : null;
      experience.anchors.manifesto = manifesto ? measureAnchor(manifesto) : null;
      experience.anchors.sound = sound ? measureAnchor(sound) : null;
      if (manifestoSection) experience.anchors.manifestoTop = top(manifestoSection);
      experience.anchors.soundTop = soundSection ? top(soundSection) : Infinity;
      // The layer sleeps once the last station's section has left the viewport.
      const last = soundSection ?? manifestoSection;
      experience.anchors.sleepAfter = last ? bottom(last) : Infinity;
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

  // The disc is drawn: the posters hand over, and the layer fades in with it.
  const [shown, setShown] = useState(false);
  const onReady = useCallback(() => {
    document.documentElement.dataset.disc = "webgl";
    setShown(true);
  }, []);

  // WebGL gone (no context made, or a lost one): the posters are the disc
  // again, for the rest of the visit.
  const onLost = useCallback(() => {
    delete document.documentElement.dataset.disc;
    setMount(false);
  }, []);

  useEffect(() => () => void delete document.documentElement.dataset.disc, []);

  if (!mount) return null;

  return (
    <div className={styles.layer} style={shown ? undefined : { animationPlayState: "paused" }} aria-hidden="true">
      <CanvasBoundary onFail={onLost}>
        <DiscCanvas reducedMotion={reducedMotion} coarse={coarse} onReady={onReady} onLost={onLost} />
      </CanvasBoundary>
    </div>
  );
}
