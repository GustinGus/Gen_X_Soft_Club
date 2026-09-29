import { BufferGeometry, Float32BufferAttribute } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Procedural compact disc — no external model.
 *
 * Real proportions (Red Book): Ø120 mm, Ø15 mm spindle hole, 1.2 mm thick.
 * Units: outer radius = 1  →  1 unit = 60 mm.
 * The disc lies in the XY plane, facing +Z.
 */
export const DISC = {
  outer: 1,
  hole: 7.5 / 60,
  /** Clear polycarbonate hub ends / reflective layer begins. */
  dataInner: 0.37,
  dataOuter: 0.975,
  /** Moulded stacking ring on the hub. */
  stackInner: 0.265,
  stackOuter: 0.31,
  /** Slightly exaggerated (1.2 mm → ~1.7 mm) so the edge reads at a distance. */
  halfThickness: 0.014,
  segments: 128,
} as const;

/**
 * Flat annulus. UVs are planar (disc-space → 0..1) so printed textures map
 * naturally; tangents run *around* the disc so anisotropic highlights
 * stretch radially, like light on real CD tracks.
 */
export function annulus(inner: number, outer: number, z: number, facing: 1 | -1, segments: number = DISC.segments) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const tangents: number[] = [];
  const index: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (const r of [inner, outer]) {
      positions.push(c * r, s * r, z);
      normals.push(0, 0, facing);
      uvs.push(c * r * 0.5 + 0.5, s * r * 0.5 + 0.5);
      tangents.push(-s, c, 0, facing);
    }
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    if (facing === 1) index.push(a, b, d, a, d, c);
    else index.push(a, d, b, a, c, d);
  }

  const g = new BufferGeometry();
  g.setIndex(index);
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  g.setAttribute("tangent", new Float32BufferAttribute(tangents, 4));
  return g;
}

/** Open cylindrical band (outer rim or spindle hole wall). */
function band(radius: number, half: number, outward: boolean, segments: number = DISC.segments) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const tangents: number[] = [];
  const index: number[] = [];
  const n = outward ? 1 : -1;

  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (const z of [-half, half]) {
      positions.push(c * radius, s * radius, z);
      normals.push(c * n, s * n, 0);
      uvs.push(i / segments, z > 0 ? 1 : 0);
      tangents.push(-s, c, 0, 1);
    }
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    if (outward) index.push(a, c, d, a, d, b);
    else index.push(a, d, c, a, b, d);
  }

  const g = new BufferGeometry();
  g.setIndex(index);
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  g.setAttribute("tangent", new Float32BufferAttribute(tangents, 4));
  return g;
}

/** Clear polycarbonate shell: both faces + rim + hole wall, one draw call. */
export function createShellGeometry() {
  const { hole, outer, halfThickness: h } = DISC;
  const parts = [
    annulus(hole, outer, h, 1),
    annulus(hole, outer, -h, -1),
    band(outer, h, true),
    band(hole, h, false, 48),
  ];
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Reflective data layer, sandwiched just under the label side. */
export function createDataLayerGeometry() {
  return annulus(DISC.dataInner, DISC.dataOuter, DISC.halfThickness * 0.35, 1);
}

/** Frosted stacking ring, slightly proud of both faces. */
export function createStackRingGeometry() {
  const { stackInner, stackOuter, halfThickness: h } = DISC;
  const parts = [annulus(stackInner, stackOuter, h + 0.0015, 1, 96), annulus(stackInner, stackOuter, -h - 0.0015, -1, 96)];
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Surface that carries the printed label texture. */
export function createPrintGeometry() {
  return annulus(DISC.hole, DISC.outer, DISC.halfThickness + 0.0008, 1);
}
