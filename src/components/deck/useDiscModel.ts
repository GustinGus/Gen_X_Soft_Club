"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { supportsWebGL } from "@/lib/webgl";
import type { DeckState } from "./deckMachine";

type Options = {
  /** The model may be used here at all (pointer, layout, build). */
  enabled: boolean;
  deck: RefObject<HTMLElement | null>;
  state: DeckState;
  /** Fetches the canvas' code (three.js, the disc). */
  load: () => Promise<unknown>;
  /** Inspection: no one will press a key, so prepare straight away. */
  immediate: boolean;
};

type Stage = "idle" | "loading" | "loaded" | "mounted" | "failed";

type Connection = { saveData?: boolean; effectiveType?: string };

/** The reader asked for less data, or is on a connection too slow to spend it on a disc. */
const frugal = () => {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return !!connection && (connection.saveData === true || /(^|-)2g$/.test(connection.effectiveType ?? ""));
};

/** Something of the deck's sequence is still moving (disc, print or card). */
const moving = (deck: HTMLElement) =>
  [
    ...deck.querySelectorAll("[data-deck-disc], [data-disc-print]"),
    ...(deck.closest("article")?.querySelectorAll('[data-vt="catalogue-card"]') ?? []),
  ].some((el) => el.getAnimations().some((a) => a.playState === "running"));

/**
 * THE DISC MODEL'S PREPARATION — when the physical disc is fetched and made
 * ready, so the machine never waits for it and the page never pays for it
 * unless the deck is about to be used.
 *
 *   intent ─ fetch the code ─ (deck at rest, browser idle) ─ mount ─ ready
 *
 * Intent is the reader reaching for the deck: the pointer entering it, a key
 * taking focus, or INSERT itself. Nothing is fetched before that, and never
 * with Save-Data on or without WebGL. The canvas is only made while the
 * deck is at rest; from there its shaders are prepared off the main thread,
 * so a key pressed meanwhile starts its sequence at once, with the posters.
 */
export function useDiscModel({ enabled, deck, state, load, immediate }: Options) {
  const [stage, setStage] = useState<Stage>("idle");
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  const arm = useCallback(() => {
    if (started.current || !enabled) return;
    started.current = true;
    if (frugal() || !supportsWebGL()) return setStage("failed");
    setStage("loading");
    load().then(
      () => setStage("loaded"),
      () => setStage("failed"),
    );
  }, [enabled, load]);

  // Inspection (a forced state): prepare without waiting for a gesture.
  useEffect(() => {
    if (!immediate || !enabled) return;
    const id = setTimeout(arm, 0);
    return () => clearTimeout(id);
  }, [immediate, enabled, arm]);

  // Fetched: mount once the deck is at rest and the browser has a moment.
  const atRest = state === "empty" || state === "ready";
  useEffect(() => {
    if (stage !== "loaded" || !atRest) return;
    let timer = 0;
    let idle = 0;
    const mount = () => setStage("mounted");
    const wait = () => {
      const el = deck.current;
      if (el && moving(el)) {
        timer = setTimeout(wait, 200) as unknown as number;
      } else if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(mount, { timeout: 1000 });
      } else {
        timer = setTimeout(mount, 100) as unknown as number;
      }
    };
    wait();
    return () => {
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [stage, atRest, deck]);

  const onReady = useCallback(() => setReady(true), []);

  // The canvas could not be made, or lost its context (no context, a broken
  // chunk, a GPU reset): posters for the rest of this visit, with no further
  // attempt — a context the browser gives back is not taken up again.
  const fail = useCallback(() => setStage("failed"), []);

  return {
    /** Call on any sign the deck is about to be used. */
    arm,
    /** Call if the canvas throws or loses its context. */
    fail,
    /** Render the canvas (hidden until a cycle uses it). */
    mount: stage === "mounted",
    /** The labelled disc has been drawn, by a canvas that is still there. */
    ready: enabled && ready && stage === "mounted",
    onReady,
  };
}
