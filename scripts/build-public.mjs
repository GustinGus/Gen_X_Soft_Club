/*
 * PUBLIC BUILD — `npm run build:public`.
 *
 * The one way to build the public edition: it sets the switch, builds into a
 * folder of its own that starts empty, and then inspects what was built. It
 * succeeds only if all three do.
 *
 *   1. PUBLIC_BUILD=1 — next.config.ts stops unless public/ is clean and every
 *      record has a sleeve.
 *   2. next build → .next-public (emptied first, so nothing a private build
 *      left behind can be in it).
 *   3. scripts/verify-public-build.mjs — reads the result and fails on any
 *      trace of the private artwork.
 */
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = ".next-public";

// The edition follows from PUBLIC_BUILD alone: nothing inherited from the shell may decide it.
const env = { ...process.env, PUBLIC_BUILD: "1" };
delete env.NEXT_PUBLIC_EDITION;
delete env.NEXT_PUBLIC_REFERENCE_COVERS;

function run(label, args) {
  console.log(`\n[public build] ${label}`);
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n[public build] FAILED at: ${label}. No public build was produced.`);
    rmSync(join(root, DIST), { recursive: true, force: true });
    process.exit(result.status ?? 1);
  }
}

rmSync(join(root, DIST), { recursive: true, force: true });
run("next build", [join(root, "node_modules/next/dist/bin/next"), "build"]);
run("verify", [join(root, "scripts/verify-public-build.mjs")]);
console.log(`\n[public build] OK — ${DIST} holds the public edition.`);
