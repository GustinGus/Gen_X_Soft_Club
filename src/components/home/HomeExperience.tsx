"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { experience, scaled } from "@/experience/store";
import { DiscLayer } from "@/experience/disc/DiscLayer";
import { runEnterSequence } from "@/motion/enterSequence";
import { enterTimeline } from "@/motion/tokens";
import { usePointerField } from "@/motion/usePointerField";
import { CURSOR_RESET_EVENT } from "@/components/cursor/Cursor";
import { useFinePointer, useReducedMotion } from "@/motion/useMediaQuery";
import { Hero } from "./Hero";
import { Manifesto } from "./Manifesto";
import { AfterHours } from "@/components/music/AfterHours";
import { Frequencies } from "@/components/music/Frequencies";
import { SoundOfTheClub } from "@/components/music/SoundOfTheClub";
import styles from "./HomeExperience.module.css";

/**
 * Home orchestration: lobby → (ENTER) → manifesto.
 *
 * Two routes lead to the same state and never fight each other:
 *   - ENTER THE CLUB: the cinematic shot (runEnterSequence)
 *   - plain scrolling: the disc interpolates by scroll progress and the
 *     manifesto reveals when it comes into view
 * Scroll is never locked or hijacked.
 */
export function HomeExperience() {
  const heroRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const entering = useRef(false);

  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  const [motionPaused, setMotionPaused] = useState(false);

  usePointerField(heroRef, finePointer && !reducedMotion && !motionPaused);

  useEffect(() => {
    experience.motionPaused = motionPaused;
    experience.invalidate();
  }, [motionPaused]);

  const reveal = useCallback((delay = 0) => {
    const el = manifestoRef.current;
    if (!el || el.dataset.reveal === "revealed") return;
    el.style.setProperty("--reveal-delay", `${delay}ms`);
    el.dataset.reveal = "revealed";
  }, []);

  // Manifesto starts "pending" only if it is below the fold at load
  // (server / no-JS markup stays fully visible).
  useEffect(() => {
    const el = manifestoRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.75) el.dataset.reveal = "pending";

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entering.current) reveal();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  const onEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (entering.current || !heroRef.current || !flashRef.current) return;
      entering.current = true;
      // The disc stops being grabbable now; never leave [ ROTATE ] on screen.
      window.dispatchEvent(new CustomEvent(CURSOR_RESET_EVENT, { detail: { only: ["rotate"] } }));

      runEnterSequence({
        stage: heroRef.current,
        flash: flashRef.current,
        reducedMotion,
        onCut: () => {
          window.dispatchEvent(new Event(CURSOR_RESET_EVENT));
          const manifesto = manifestoRef.current;
          if (manifesto) {
            window.scrollTo({ top: manifesto.offsetTop, behavior: "instant" });
          }
          reveal(reducedMotion ? 0 : scaled(enterTimeline.revealDelay));
          headingRef.current?.focus({ preventScroll: true });
          experience.invalidate();
        },
      }).finally(() => {
        entering.current = false;
      });
    },
    [reducedMotion, reveal],
  );

  return (
    <>
      <a className="skip-link" href="#manifesto">
        Skip to manifesto
      </a>
      <main className={styles.home}>
        <Hero
          ref={heroRef}
          onEnter={onEnter}
          motionPaused={motionPaused}
          onToggleMotion={reducedMotion ? undefined : () => setMotionPaused((p) => !p)}
        />
        <Manifesto ref={manifestoRef} headingRef={headingRef} />
        <SoundOfTheClub />
        <Frequencies />
        <AfterHours />
      </main>
      <DiscLayer />
      <div ref={flashRef} className={styles.flash} aria-hidden="true" />
    </>
  );
}
