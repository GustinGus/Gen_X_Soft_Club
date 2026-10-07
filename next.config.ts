import { existsSync, readdirSync } from "node:fs";
import type { NextConfig } from "next";
import { records } from "./src/content/music";

/*
  PUBLIC BUILD GUARD. Reference artwork (content/music.ts) is not licensed
  and must never reach a public build. Building with PUBLIC_BUILD=1 fails
  while any record still carries it:

    PowerShell   $env:PUBLIC_BUILD = "1"; npm run build
    bash         PUBLIC_BUILD=1 npm run build

  It reads the data, not the disk: a record is held back by its state,
  whether or not the file is present. Private builds are unaffected, and
  none of this is part of what the browser receives.
*/
if (process.env.PUBLIC_BUILD === "1") {
  const held = records.filter((r) => r.artwork.status === "reference");
  if (held.length > 0) {
    throw new Error(
      `PUBLIC_BUILD: ${held.length} record(s) still carry reference artwork, which is not licensed for redistribution: ${held
        .map((r) => r.slug)
        .join(", ")}. Give each a licensed cover or return it to the placeholder, and delete public/covers/reference/.`,
    );
  }
}

/*
  Reference covers are local files that are never versioned, so a clone may
  not have them. The names present are handed to the app when Next starts
  (content/music.ts, coverOf): a record whose file is missing shows its
  placeholder, and nothing is requested that is not there.
*/
const REFERENCE_COVERS = "public/covers/reference";
const referenceCovers = existsSync(REFERENCE_COVERS) ? readdirSync(REFERENCE_COVERS).join(",") : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_REFERENCE_COVERS: referenceCovers },
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
