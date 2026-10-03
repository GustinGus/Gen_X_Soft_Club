"use client";

import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { NeutralToneMapping, type Group, type PerspectiveCamera } from "three";
import { DISC } from "@/experience/disc/discGeometry";
import { DiscModel } from "@/experience/disc/DiscModel";
import { createFluorescentEnvironmentAsync, type Environment as Room } from "@/experience/disc/fluorescentEnvironmentAsync";
import { linkInTurn } from "@/experience/disc/linkInTurn";
import { experience } from "@/experience/store";

/** Same lens as the Home's disc, so the materials answer the light the same way. */
const FOV = 30;
/** The lens' full frame: a square this many disc radii across, centred on the
 *  seat. The canvas is a window cut out of (and beyond) that frame. */
const FRAME = 2 * 1.08;
/** Distance at which the full frame is FRAME disc radii across — taken from
 *  the disc's upper face, which is the outline the DOM box describes. */
const DISTANCE = DISC.halfThickness + FRAME / 2 / Math.tan((FOV * Math.PI) / 360);
/** Quarter turn about X: the room's ceiling comes round to face the disc. */
const ROOM_TURN = Math.PI / 2;
/** How much of the room's light the disc returns under the smoked window. */
const ROOM_LIGHT = 1.25;
/** The tube right over the deck: it draws the radial streak across the tracks. */
const KEY_LIGHT = 1.6;
/** Frames the follower keeps looking after the last motion it saw (a
 *  sequence's next leg starts on the frame the previous one ends). */
const SETTLE = 12;

/** What the canvas owes the picture, kept on the scene: set by anything that
 *  changes it without moving the disc (the room, the label arriving). */
type Owed = { picture?: boolean; labelled?: boolean };

/**
 * The room the disc reflects — the Home's own, once per renderer, turned so
 * its ceiling is in front of the lens: the deck lies on the table and is
 * seen from above, so the disc faces the tubes, not a wall.
 */
function Environment({ quiet }: { quiet: () => Promise<void> }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { gl, scene, invalidate } = get();
    let room: Room | null = null;
    let dropped = false;
    // The room is made without stalling on its shaders, so it arrives later;
    // a canvas dropped meanwhile ends it with nothing.
    createFluorescentEnvironmentAsync(gl, () => !dropped, quiet).then((made) => {
      if (!made) return;
      if (dropped) return made.dispose();
      room = made;
      scene.environment = made.texture;
      scene.environmentRotation.set(ROOM_TURN, 0, 0);
      scene.environmentIntensity = ROOM_LIGHT;
      (scene.userData as Owed).picture = true;
      invalidate();
    });
    return () => {
      dropped = true;
      scene.environment = null;
      room?.dispose();
    };
  }, [get, quiet]);
  return null;
}

/** The disc asks for a frame through the shared store (its label arriving). */
function Bridge() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const request = () => {
      const { scene, invalidate } = get();
      const owed = scene.userData as Owed;
      owed.picture = true;
      owed.labelled = true;
      invalidate();
    };
    experience.invalidate = request;
    return () => {
      if (experience.invalidate === request) experience.invalidate = () => {};
    };
  }, [get]);
  return null;
}

const running = (el: Element | null) => !!el && el.getAnimations().some((a) => a.playState === "running");

type RigProps = {
  deck: RefObject<HTMLElement | null>;
  pose: string;
  active: boolean;
  onReady: () => void;
  onLost: () => void;
  quiet: () => Promise<void>;
  children: React.ReactNode;
};

/**
 * Puts the one disc where the deck's DOM says it is — every frame it moves.
 *
 * The deck's sequence moves, fades and turns the poster disc; this only
 * reads that element back (its box, its opacity, its print's angle) and
 * draws the model there. It holds no timing, easing or state of its own, so
 * an interrupted insertion reverses here exactly as it does in the DOM.
 *
 * Nothing here knows the deck's dimensions either: the canvas, the disc's
 * box and the spindle (`data-deck-seat`) are measured on screen. One world
 * unit is the disc's radius; the lens looks straight down the spindle, and
 * the canvas is an off-centre cut of its frame.
 *
 * Frames: while the poster has a running animation the loop is kept awake,
 * but a picture is only drawn when something in it changed — a disc at rest,
 * or waiting out a pause in the sequence, costs no GL work.
 */
function Rig({ deck, pose, active, onReady, onLost, quiet, children }: RigProps) {
  const group = useRef<Group>(null);
  const drawn = useRef("");
  const reported = useRef(false);
  const lost = useRef(false);
  const compiled = useRef<"" | "pending" | "done">("");
  const invalidate = useThree((s) => s.invalidate);
  const canvas = useThree((s) => s.gl.domElement);

  // Keep frames coming while the deck's sequence is moving the disc.
  useEffect(() => {
    const el = deck.current;
    if (!el) return;
    if (!active) {
      // Not this cycle's disc: draw nothing more, and show nothing stale when
      // it next becomes the disc. (One frame is still owed at first, to compile.)
      const stage = canvas.closest<HTMLElement>("[data-deck-stage]");
      if (stage) stage.style.opacity = "0";
      invalidate();
      return;
    }
    let frame = 0;
    let quiet = 0;
    const watch = () => {
      const box = el.querySelector('[data-deck-disc="window"]');
      quiet = running(box) || running(box?.querySelector("[data-disc-print]") ?? null) ? 0 : quiet + 1;
      invalidate();
      frame = quiet < SETTLE ? requestAnimationFrame(watch) : 0;
    };
    watch();
    const observer = new ResizeObserver(() => {
      if (!frame) watch();
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [deck, pose, active, canvas, invalidate]);

  // A lost context ends the model for this visit: nothing more is drawn or
  // reported, and the deck goes back to the posters (it drops this canvas).
  useEffect(() => {
    const end = () => {
      if (lost.current) return;
      lost.current = true;
      onLost();
    };
    canvas.addEventListener("webglcontextlost", end);
    return () => canvas.removeEventListener("webglcontextlost", end);
  }, [canvas, onLost]);

  // Takes over rendering (priority 1): measure, and draw only if the picture changed.
  useFrame(({ gl, scene, camera, size, viewport }) => {
    if (lost.current) return;
    const el = deck.current;
    const stage = gl.domElement.closest<HTMLElement>("[data-deck-stage]");
    const owed = scene.userData as Owed;
    if (!el || !stage || !group.current) return;
    // Idle between its cycles: the only frame it draws is the first (shaders, readiness).
    if (!active && reported.current) return;

    const box = active ? el.querySelector<HTMLElement>('[data-deck-disc="window"]') : null;
    const seat = el.querySelector("[data-deck-seat]")?.getBoundingClientRect();
    const view = gl.domElement.getBoundingClientRect();

    let key = `${size.width}x${size.height}@${viewport.dpr}`;
    if (box && seat && view.width) {
      const at = box.getBoundingClientRect();
      const style = getComputedStyle(box);
      const print = box.querySelector("[data-disc-print]");
      const turn = print ? parseFloat(getComputedStyle(print).rotate) || 0 : 0;
      const radius = at.width / 2;
      const seatX = seat.left + seat.width / 2;
      const seatY = seat.top + seat.height / 2;
      const frame = FRAME * radius;
      const x = (at.left + radius - seatX) / radius;
      const y = -(at.top + radius - seatY) / radius;
      const cutX = view.left - (seatX - frame / 2);
      const cutY = view.top - (seatY - frame / 2);

      stage.style.opacity = style.opacity;
      key += [x, y, turn, radius, cutX, cutY, view.width, view.height].map((n) => n.toFixed(3)).join();

      if (key !== drawn.current) {
        const lens = camera as PerspectiveCamera;
        lens.aspect = 1;
        lens.setViewOffset(frame, frame, cutX, cutY, view.width, view.height);
        group.current.position.set(x, y, 0);
        // CSS turns clockwise on screen; the disc faces the lens, so that is -z.
        group.current.rotation.z = (-turn * Math.PI) / 180;
      }
    } else {
      // No disc in the deck: nothing to show, and nothing new to draw.
      stage.style.opacity = "0";
    }

    if (key === drawn.current && !owed.picture) return;

    // No picture until the disc's programs are linked: with the room and the
    // label in place they are compiled off the main thread, instead of
    // stalling the first draw on each of them.
    if (compiled.current !== "done") {
      if (!compiled.current && owed.labelled && scene.environment) {
        compiled.current = "pending";
        linkInTurn(gl, scene, camera, quiet).then(() => {
          compiled.current = "done";
          owed.picture = true;
          invalidate();
        });
      }
      return;
    }

    drawn.current = key;
    owed.picture = false;
    gl.render(scene, camera);

    // Ready once the labelled disc has actually been drawn — which a context
    // lost before anyone heard of it has not done.
    if (owed.labelled && scene.environment && !reported.current && !gl.getContext().isContextLost()) {
      reported.current = true;
      onReady();
    }
  }, 1);

  return <group ref={group}>{children}</group>;
}

type Props = {
  /** The record's catalogue number, printed on the disc. */
  label: string;
  /** The deck: its DOM says where the disc and the spindle are. */
  deck: RefObject<HTMLElement | null>;
  /** The deck's state — a change is when its sequence starts moving the disc. */
  pose: string;
  /** This cycle's disc is the model: follow the sequence and draw. Otherwise
   *  the canvas only prepares itself (one frame) and stays idle. */
  active: boolean;
  /** The labelled disc has been drawn. */
  onReady: () => void;
  /** The context was lost: this canvas will draw nothing more. */
  onLost: () => void;
  /** Resolves when the deck is still: each heavy step of the preparation waits on it. */
  quiet: () => Promise<void>;
  /** Placement: the area of the deck the disc can be seen in. */
  className?: string;
};

/**
 * THE DECK'S VIEW OF THE DISC — the same physical object as the Home's
 * (`DiscModel`), seen from straight above, label up, as it lies in the deck.
 *
 * One canvas and one disc for every place it can be: out of the slot, half
 * in, seated under the window. Only a viewport — where the disc is, how it
 * moves and what covers it stay DOM. It draws on demand: a disc at rest
 * costs no frames.
 */
export default function DeckCanvas({ label, deck, pose, active, onReady, onLost, quiet, className }: Props) {
  const [monoFamily] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim() || "monospace",
  );

  // A state change repositions the disc in the DOM at once (reduced motion
  // jumps it from the seat to the slot): ask for a frame before that paint,
  // so the model is never drawn a frame behind where the deck put it.
  useLayoutEffect(() => {
    if (active) invalidate();
  }, [pose, active]);

  return (
    <div className={className} data-deck-stage="" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: FOV, position: [0, 0, DISTANCE], near: 1, far: 10, manual: true }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: NeutralToneMapping }}
        style={{ pointerEvents: "none" }}
      >
        <Environment quiet={quiet} />
        <Bridge />
        {/* The Home disc's key light, from its resting place. */}
        <directionalLight position={[2.5, 3, 6]} intensity={KEY_LIGHT} color="#f1f4ee" />
        <Rig deck={deck} pose={pose} active={active} onReady={onReady} onLost={onLost} quiet={quiet}>
          {/* A record's disc carries its catalogue number and no issue line. */}
          <DiscModel monoFamily={monoFamily} label={label} issue={null} />
        </Rig>
      </Canvas>
    </div>
  );
}
