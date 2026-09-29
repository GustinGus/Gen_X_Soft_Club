import {
  BackSide,
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Scene,
  type WebGLRenderer,
} from "three";

/**
 * Procedural reflection environment: a concrete room lit by fluorescent tubes.
 *
 * No HDRI download — and a better fit than a generic studio map: what the
 * disc reflects is the same light the page is "lit" by (cool, diffuse,
 * institutional), with one faint green-glass panel for the tint.
 * Rendered once into a PMREM cube; the source scene is disposed immediately.
 */
export function createFluorescentEnvironment(renderer: WebGLRenderer) {
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];

  const box = (w: number, h: number, d: number, color: Color, x: number, y: number, z: number, side?: typeof BackSide) => {
    const geometry = new BoxGeometry(w, h, d);
    const material = new MeshBasicMaterial(side === undefined ? { color } : { color, side });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    disposables.push(geometry, material);
    return mesh;
  };

  // Room: pale concrete, a step darker than the page so reflections keep contrast.
  box(12, 8, 12, new Color("#a3aaa5"), 0, 0, 0, BackSide);
  // Darker floor half — gives the disc a horizon line in its reflection.
  box(11.8, 0.05, 11.8, new Color("#6c7471"), 0, -3.9, 0);

  // Ceiling tubes — long, thin, slightly overexposed (values > 1 read as emissive in PMREM).
  const tube = new Color("#f2f5ee").multiplyScalar(6);
  for (const x of [-3.2, -1.1, 1.1, 3.2]) box(0.16, 0.06, 7.5, tube, x, 3.9, 0);

  // Front strip: the light the viewer stands under — produces the long streak on the disc.
  box(6.5, 0.12, 0.12, new Color("#eef2ea").multiplyScalar(4), 0, 1.4, 5.6);

  // Faint green-glass panel (the palette's "Glass"), and a phosphor floor bounce.
  box(3.4, 2.6, 0.05, new Color("#a8c9c1").multiplyScalar(1.6), -5.8, 0.4, -1.5);
  box(4, 0.02, 3, new Color("#c6d8a7").multiplyScalar(0.5), 1.5, -3.95, 1);

  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  disposables.forEach((d) => d.dispose());

  return target;
}
