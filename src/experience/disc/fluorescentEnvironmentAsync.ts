import { PMREMGenerator, type Texture, type WebGLRenderer } from "three";
import { createFluorescentRoom, ROOM_BLUR } from "./fluorescentEnvironment";

/** A reflection map and what frees it. */
export type Environment = { texture: Texture; dispose(): void };

/**
 * The same room as `createFluorescentEnvironment`, without stalling on its
 * shaders.
 *
 * The prefilter draws with four programs of its own, and the first draw with
 * each waits for the driver to link it. Here the generator is first run with
 * nothing drawn — every draw only asks for its program, which the driver then
 * links off the main thread — and run for real once they are all linked.
 *
 * `alive` going false (the canvas was dropped) ends it with `null`. `quiet`,
 * if given, is awaited before the real run, the one step that takes the main
 * thread for a while: the page says when it can.
 */
export async function createFluorescentEnvironmentAsync(
  renderer: WebGLRenderer,
  alive: () => boolean,
  quiet?: () => Promise<void>,
): Promise<Environment | null> {
  const room = createFluorescentRoom();
  const pmrem = new PMREMGenerator(renderer);
  const end = () => {
    pmrem.dispose();
    room.dispose();
  };

  // The dry run: same targets, same state, so the programs asked for are
  // exactly the ones the real run will use.
  const render = renderer.render;
  renderer.render = (object, camera) => void renderer.compile(object, camera);
  try {
    pmrem.fromScene(room.scene, ROOM_BLUR).dispose();
  } finally {
    renderer.render = render;
  }

  // (`isReady` is three's own, missing from its types.)
  const programs = () => (renderer.info.programs ?? []) as unknown as { isReady(): boolean }[];
  const linked = () => programs().every((program) => program.isReady());
  while (alive() && !renderer.getContext().isContextLost() && !linked()) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (quiet && alive()) await quiet();
  if (!alive() || renderer.getContext().isContextLost()) {
    end();
    return null;
  }

  const target = pmrem.fromScene(room.scene, ROOM_BLUR);
  end();
  return target;
}
