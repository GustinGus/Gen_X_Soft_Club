import type { Camera, Mesh, Object3D, Scene, WebGLRenderer } from "three";

/**
 * Links the scene's programs off the main thread, one mesh at a time: asked
 * for all at once, the driver compiles them in a burst that can stall the
 * whole page for a moment.
 *
 * To be called with the scene as it will be drawn (its room, its lights, its
 * textures on), before its first frame — which then costs no compilation.
 */
export async function linkInTurn(gl: WebGLRenderer, scene: Scene, camera: Camera) {
  const meshes: Object3D[] = [];
  scene.traverse((object) => {
    if ((object as Mesh).isMesh) meshes.push(object);
  });
  for (const mesh of meshes) await gl.compileAsync(mesh, camera, scene);
}
