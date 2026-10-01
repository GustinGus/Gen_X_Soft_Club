"use client";

import { useEffect, useMemo } from "react";
import { Color, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, type Texture } from "three";
import { experience } from "../store";
import {
  createDataLayerGeometry,
  createPrintGeometry,
  createShellGeometry,
  createStackRingGeometry,
} from "./discGeometry";
import { createLabelTexture } from "./labelTexture";

/**
 * THE DISC AS AN OBJECT — geometry, materials and printed label of the
 * procedural CD, with nothing about where it is or how it moves.
 *
 * Renders its four meshes straight into the parent group (no wrapper node),
 * so whoever holds it owns pose, tilt, yaw, spin and light. The Home's
 * `Disc` is that holder today.
 */
export function DiscModel({ monoFamily }: { monoFamily: string }) {
  // ---------------------------------------------------------------- geometry
  const geo = useMemo(
    () => ({
      shell: createShellGeometry(),
      data: createDataLayerGeometry(),
      stack: createStackRingGeometry(),
      print: createPrintGeometry(),
    }),
    [],
  );

  // ---------------------------------------------------------------- materials
  const mat = useMemo(() => {
    // Clear polycarbonate with a faint green-glass tint. No transmission pass:
    // the page behind is DOM, so real refraction would sample nothing.
    const shell = new MeshPhysicalMaterial({
      color: new Color("#b7d3cb"),
      metalness: 0,
      roughness: 0.07,
      transparent: true,
      opacity: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 0.35,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [180, 520],
      side: DoubleSide,
      depthWrite: false,
    });

    // Reflective layer: brushed-looking aluminium with thin-film iridescence.
    // Anisotropy along the circumferential tangents → radial light streaks.
    const data = new MeshPhysicalMaterial({
      color: new Color("#d9dedb"),
      metalness: 1,
      roughness: 0.24,
      anisotropy: 0.8,
      iridescence: 1,
      iridescenceIOR: 1.7,
      iridescenceThicknessRange: [320, 900],
      transparent: true,
      opacity: 0.9,
      side: DoubleSide,
    });

    // Moulded, frosted stacking ring.
    const stack = new MeshStandardMaterial({
      color: new Color("#dfe6e1"),
      roughness: 0.55,
      metalness: 0,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    const print = new MeshStandardMaterial({
      color: new Color("#ffffff"),
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });

    return { shell, data, stack, print };
  }, []);

  // Printed label: needs the web font to be ready before drawing to canvas.
  useEffect(() => {
    let texture: Texture | null = null;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      texture = createLabelTexture(monoFamily);
      mat.print.map = texture;
      mat.print.needsUpdate = true;
      experience.invalidate();
    });
    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, [mat, monoFamily]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mat).forEach((mt) => mt.dispose());
    },
    [geo, mat],
  );

  return (
    <>
      <mesh geometry={geo.data} material={mat.data} renderOrder={1} />
      <mesh geometry={geo.shell} material={mat.shell} renderOrder={2} />
      <mesh geometry={geo.stack} material={mat.stack} renderOrder={3} />
      <mesh geometry={geo.print} material={mat.print} renderOrder={4} />
    </>
  );
}
