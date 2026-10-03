import type { Camera, Mesh, Object3D, Scene, WebGLRenderer } from "three";

/**
 * Links the scene's programs off the main thread, one mesh at a time: asked
 * for all at once, the driver compiles them in a burst that can stall the
 * whole page for a moment.
 *
 * To be called with the scene as it will be drawn (its room, its lights, its
 * textures on), before its first frame — which then costs no compilation.
 * `quiet`, if given, is awaited before each mesh: the page says when it can
 * take the (short) work of asking for one.
 */
export async function linkInTurn(gl: WebGLRenderer, scene: Scene, camera: Camera, quiet?: () => Promise<void>) {
  const meshes: Object3D[] = [];
  scene.traverse((object) => {
    if ((object as Mesh).isMesh) meshes.push(object);
  });
  for (const mesh of meshes) {
    if (quiet) await quiet();
    await gl.compileAsync(mesh, camera, scene);
  }
}
