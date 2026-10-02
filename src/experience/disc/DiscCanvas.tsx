"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { NeutralToneMapping } from "three";
import { experience } from "../store";
import { Disc } from "./Disc";
import { createFluorescentEnvironmentAsync, type Environment as Room } from "./fluorescentEnvironmentAsync";
import { linkInTurn } from "./linkInTurn";

/**
 * Makes the scene drawable without stalling the page: the procedural
 * fluorescent room (once per renderer), then the disc's programs, both
 * compiled off the main thread. `onPrepared` once a frame costs no
 * compilation; if it cannot be done (a lost context) it is never called.
 */
function Preparation({ onPrepared }: { onPrepared: () => void }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    // Read from the store inside the effect: three objects are mutated, not React state.
    const { gl, scene, camera } = get();
    let room: Room | null = null;
    let dropped = false;
    const prepare = async () => {
      const made = await createFluorescentEnvironmentAsync(gl, () => !dropped);
      if (!made) return;
      if (dropped) return made.dispose();
      room = made;
      scene.environment = made.texture;
      // The label is printed once the fonts are in (DiscModel, which asked
      // first): the programs are linked for the disc as it will be drawn.
      await document.fonts.ready;
      await linkInTurn(gl, scene, camera);
      if (!dropped) onPrepared();
    };
    prepare().catch(() => {});
    return () => {
      dropped = true;
      scene.environment = null;
      room?.dispose();
    };
  }, [get, onPrepared]);
  return null;
}

/** Exposes R3F's invalidate to DOM code (scroll, resize, enter). */
function Bridge() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    experience.invalidate = () => invalidate();
    return () => {
      experience.invalidate = () => {};
    };
  }, [invalidate]);
  return null;
}

/**
 * What the page needs to know of the canvas: that the disc is on screen
 * (`onReady`, on the frame after the first one drawn), and that its context
 * was lost (`onLost`).
 */
function Presence({ onReady, onLost }: { onReady: () => void; onLost: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const canvas = useThree((s) => s.gl.domElement);

  useEffect(() => {
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [canvas, onLost]);

  useFrame(() => {
    if (frames.current > 1) return;
    if (++frames.current === 2) onReady();
    else invalidate(); // on demand (reduced motion), the second frame is asked for
  });
  return null;
}

type Props = {
  reducedMotion: boolean;
  coarse: boolean;
  /** The disc has been drawn. */
  onReady: () => void;
  /** The context was lost: the canvas will draw nothing more. */
  onLost: () => void;
};

/**
 * The WebGL layer. Loaded lazily (see DiscLayer) so three.js never blocks
 * first paint — the CSS poster disc holds the composition until this mounts,
 * and until the scene is prepared: no frame runs before that, so the disc
 * starts from its first pose when it is first drawn.
 */
export default function DiscCanvas({ reducedMotion, coarse, onReady, onLost }: Props) {
  const [monoFamily] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim() || "monospace",
  );
  const [awake, setAwake] = useState(true);
  const [prepared, setPrepared] = useState(false);
  const onPrepared = useCallback(() => {
    // A drag made on the poster turned nothing on screen: the first frame
    // starts from the pose the poster shows, and a hand still on the disc
    // carries on from there.
    experience.drag.delta = 0;
    experience.drag.velocity = 0;
    setPrepared(true);
  }, []);

  // Sleep once the reader has scrolled past the disc's last station; wake on return.
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY < experience.anchors.sleepAfter;
      setAwake((prev) => (prev === next ? prev : next));
      experience.invalidate();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Prepared: the first frame (on demand, nothing else would ask for it).
  useEffect(() => {
    if (prepared) experience.invalidate();
  }, [prepared]);

  const frameloop = !prepared || !awake ? "never" : reducedMotion ? "demand" : "always";

  return (
    <Canvas
      frameloop={frameloop}
      dpr={coarse ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 10], near: 1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: NeutralToneMapping }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Preparation onPrepared={onPrepared} />
      <Bridge />
      <Presence onReady={onReady} onLost={onLost} />
      <Disc monoFamily={monoFamily} />
    </Canvas>
  );
}
