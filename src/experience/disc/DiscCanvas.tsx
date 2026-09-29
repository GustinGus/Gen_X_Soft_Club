"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { NeutralToneMapping } from "three";
import { experience } from "../store";
import { Disc } from "./Disc";
import { createFluorescentEnvironment } from "./fluorescentEnvironment";

/** Installs the procedural fluorescent environment once per renderer. */
function Environment() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    // Read from the store inside the effect: three objects are mutated, not React state.
    const { gl, scene, invalidate } = get();
    const target = createFluorescentEnvironment(gl);
    scene.environment = target.texture;
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [get]);
  return null;
}

/** Exposes R3F's invalidate to DOM code (scroll, resize, enter). */
function Bridge({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    experience.invalidate = () => invalidate();
    onReady();
    return () => {
      experience.invalidate = () => {};
    };
  }, [invalidate, onReady]);
  return null;
}

type Props = {
  reducedMotion: boolean;
  coarse: boolean;
  onReady: () => void;
};

/**
 * The WebGL layer. Loaded lazily (see DiscLayer) so three.js never blocks
 * first paint — the CSS poster disc holds the composition until this mounts.
 */
export default function DiscCanvas({ reducedMotion, coarse, onReady }: Props) {
  const [monoFamily] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim() || "monospace",
  );
  const [awake, setAwake] = useState(true);

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

  const frameloop = !awake ? "never" : reducedMotion ? "demand" : "always";

  return (
    <Canvas
      frameloop={frameloop}
      dpr={coarse ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 10], near: 1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: NeutralToneMapping }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Environment />
      <Bridge onReady={onReady} />
      <Disc monoFamily={monoFamily} />
    </Canvas>
  );
}
