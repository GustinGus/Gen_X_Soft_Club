/** True when a WebGL2 context can be created. Checked once, client-only. */
let cached: boolean | null = null;

export function supportsWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!canvas.getContext("webgl2");
  } catch {
    cached = false;
  }
  return cached;
}
