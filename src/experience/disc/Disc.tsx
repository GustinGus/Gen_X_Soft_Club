"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  type Texture,
} from "three";
import { experience, scaled, type Rect } from "../store";
import {
  ambient,
  clamp01,
  damp,
  easeInOutCubic,
  easeOutQuad,
  enterTimeline,
  lerp,
  pushCurve,
} from "@/motion/tokens";
import {
  createDataLayerGeometry,
  createPrintGeometry,
  createShellGeometry,
  createStackRingGeometry,
} from "./discGeometry";
import { createLabelTexture } from "./labelTexture";

const TAU = Math.PI * 2;
/** Resting tilt: seen slightly from above, like a disc lifted from a tray. */
const HERO_TILT = -0.42;
const MANIFESTO_TILT = -0.62;

/** Viewport-space pose the disc is drawn at. */
type Pose = { x: number; y: number; size: number; tilt: number };

function toViewport(anchor: Rect | null, scrollY: number, fallback: Pose): Pose {
  if (!anchor) return fallback;
  return { x: anchor.x - window.scrollX, y: anchor.y - scrollY, size: anchor.size, tilt: fallback.tilt };
}

export function Disc({ monoFamily }: { monoFamily: string }) {
  const { camera, size } = useThree();
  const root = useRef<Group>(null);
  const tiltGroup = useRef<Group>(null);
  const yawGroup = useRef<Group>(null);
  const spinGroup = useRef<Group>(null);
  const key = useRef<DirectionalLight>(null);

  // Motion state (mutable, per frame).
  const m = useRef({
    // Starts face-on (yaw 0) — the same pose as the CSS poster disc, so the
    // poster → WebGL crossfade reads as one object gaining material.
    yaw: 0,
    yawVelocity: 0,
    spin: 0,
    px: 0,
    py: 0,
    faceYaw: 0,
    pushYawFrom: 0,
    lastPushStart: null as number | null,
    lastCutAt: null as number | null,
  });

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

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20) * experience.timeScale;
    const s = m.current;
    const reduced = experience.reducedMotion;
    const still = reduced || experience.motionPaused;
    const vw = size.width;
    const vh = size.height;
    const scrollY = window.scrollY;
    const now = performance.now();

    // ------------------------------------------------ base pose from DOM anchors
    const fallbackHero: Pose = { x: vw * 0.6, y: vh * 0.5, size: Math.min(vw, vh) * 0.6, tilt: HERO_TILT };
    const heroPose = toViewport(experience.anchors.hero, scrollY, fallbackHero);
    const manPose = toViewport(experience.anchors.manifesto, scrollY, {
      ...fallbackHero,
      y: fallbackHero.y + vh,
      tilt: MANIFESTO_TILT,
    });
    manPose.tilt = MANIFESTO_TILT;

    const progress = easeInOutCubic(clamp01(scrollY / Math.max(1, experience.anchors.manifestoTop)));
    const base: Pose = {
      x: lerp(heroPose.x, manPose.x, progress),
      y: lerp(heroPose.y, manPose.y, progress),
      size: lerp(heroPose.size, manPose.size, progress),
      tilt: lerp(HERO_TILT, MANIFESTO_TILT, progress),
    };

    // ------------------------------------------------ ENTER: push, cut, settle
    const { pushStart, cutAt } = experience.enter;
    let shot = 0; // 0 = composed, 1 = close-up through the spindle hole
    let spinRate = 0; // rev / s
    let facing = 0; // 0 = free yaw, 1 = locked face-on

    if (pushStart !== null && s.lastPushStart !== pushStart) {
      s.lastPushStart = pushStart;
      s.yawVelocity = 0; // a fling in progress is manual input — drop it
      s.pushYawFrom = s.yaw;
      s.faceYaw = Math.round(s.yaw / Math.PI) * Math.PI;
    }

    if (cutAt !== null) {
      if (s.lastCutAt !== cutAt) {
        s.lastCutAt = cutAt;
        s.yaw = s.faceYaw; // continue from the face-on angle
      }
      const t = clamp01((now - cutAt) / scaled(enterTimeline.settle));
      shot = Math.pow(1 - t, 4);
      spinRate = ambient.spinUpRate * Math.pow(1 - t, 2.2);
      facing = shot;
      if (t >= 1) {
        experience.enter.pushStart = null;
        experience.enter.cutAt = null;
        experience.enter.focal = null;
        experience.enter.pointer = null;
      }
    } else if (pushStart !== null) {
      const t = clamp01((now - pushStart) / scaled(enterTimeline.push));
      // Same curve as the DOM dolly: answers the click at once, then keeps
      // gathering speed toward the cut.
      shot = pushCurve(t);
      // A drive spins up fast, then holds — the disc itself acknowledges the click.
      spinRate = ambient.spinUpRate * easeOutQuad(t);
      facing = easeInOutCubic(Math.min(1, t * 1.6));
    }

    // The close-up converges on the dolly's focal point (the disc's centre at
    // click time), not the viewport centre — one camera, one centre.
    const focal = experience.enter.focal;
    const closeUp: Pose = {
      x: focal ? focal.x : vw / 2,
      y: focal ? focal.y : vh / 2,
      size: Math.max(vw, vh) * 3.4,
      tilt: 0,
    };
    const pose: Pose = {
      x: lerp(base.x, closeUp.x, shot),
      y: lerp(base.y, closeUp.y, shot),
      size: lerp(base.size, closeUp.size, shot),
      tilt: lerp(base.tilt, closeUp.tilt, facing),
    };

    // ------------------------------------------------ pointer (weighted, damped)
    // During the sequence the disc reads the pointer frozen at click time, so
    // moving the mouse cannot steer it; the automatic fade-out is unchanged.
    const pointer = pushStart !== null && experience.enter.pointer ? experience.enter.pointer : experience.pointer;
    const influence = still ? 0 : 1 - Math.max(shot, facing);
    s.px = damp(s.px, pointer.x * influence, ambient.pointerDamping, dt);
    s.py = damp(s.py, pointer.y * influence, ambient.pointerDamping, dt);

    // ------------------------------------------------ yaw: ambient + drag + inertia
    const drag = experience.drag;
    if (drag.active) {
      s.yaw += drag.delta;
      drag.delta = 0;
      s.yawVelocity = 0;
    } else {
      if (drag.velocity !== 0) {
        s.yawVelocity = drag.velocity;
        drag.velocity = 0;
      }
      s.yawVelocity = damp(s.yawVelocity, 0, 1.6, dt);
      const ambientRate = still || pushStart !== null ? 0 : TAU / ambient.yawPeriod;
      s.yaw += (ambientRate + s.yawVelocity) * dt;
    }
    s.spin += spinRate * TAU * dt;

    const cutPending = pushStart !== null && cutAt === null;
    const yaw = cutPending ? lerp(s.pushYawFrom, s.faceYaw, facing) : s.yaw;

    // ------------------------------------------------ viewport px → world units
    const cam = camera as PerspectiveCamera;
    const worldH = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
    const k = worldH / vh;

    const g = root.current!;
    g.position.set((pose.x - vw / 2) * k + s.px * 0.08, -(pose.y - vh / 2) * k - s.py * 0.06, 0);
    g.scale.setScalar((pose.size / 2) * k);
    tiltGroup.current!.rotation.x = pose.tilt + s.py * 0.16;
    yawGroup.current!.rotation.y = yaw + s.px * 0.22;
    spinGroup.current!.rotation.z = -s.spin;

    // Key light drifts with the pointer: the highlight slides across the disc.
    key.current!.position.set(2.5 + s.px * 3, 3 - s.py * 2, 6);

    // Stay idle when nothing is moving (on-demand frameloop in reduced motion).
    if (!reduced && (pushStart !== null || drag.active)) experience.invalidate();
  });

  return (
    <>
      <directionalLight ref={key} intensity={1.1} color="#f1f4ee" />
      <group ref={root}>
        <group ref={tiltGroup}>
          <group ref={yawGroup}>
            <group ref={spinGroup}>
              <mesh geometry={geo.data} material={mat.data} renderOrder={1} />
              <mesh geometry={geo.shell} material={mat.shell} renderOrder={2} />
              <mesh geometry={geo.stack} material={mat.stack} renderOrder={3} />
              <mesh geometry={geo.print} material={mat.print} renderOrder={4} />
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
