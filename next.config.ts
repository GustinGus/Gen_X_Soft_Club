import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { NextConfig } from "next";
import { records } from "./src/content/music";
import { sleeveOf } from "./src/content/sleeves";

/*
  TWO EDITIONS, ONE SWITCH.

  PRIVATE (the default)   Reference copies of the covers, where their files are
                          on this machine; the archive's own sleeve where they
                          are not, as in a fresh clone. Built into .next.

  PUBLIC (PUBLIC_BUILD=1) The archive's own sleeves and nothing else. Built
                          into .next-public by `npm run build:public`, which
                          also inspects what was built (scripts/).

  PUBLIC_BUILD is the only switch. NEXT_PUBLIC_EDITION, which the app reads,
  is set here from it and must not be set by hand. None of this file is part
  of what the browser receives.
*/
const publicBuild = process.env.PUBLIC_BUILD === "1";
const edition = publicBuild ? "public" : "";

const given = process.env.NEXT_PUBLIC_EDITION;
if (given !== undefined && given !== edition) {
  throw new Error(
    `NEXT_PUBLIC_EDITION is set to "${given}", but it follows from PUBLIC_BUILD and is not a setting of its own. Unset it; for the public edition run \`npm run build:public\`.`,
  );
}

/*
  ON VERCEL, ONLY THE PUBLIC EDITION. Vercel sets VERCEL=1 for every build it
  runs, and what it builds is deployed. A private build there would be a
  deployment of the private edition: it is refused. The build command is
  `npm run build:public` (vercel.json). Other CI is not concerned: private
  builds and tests run there as on any machine.
*/
if (process.env.VERCEL === "1" && !publicBuild) {
  throw new Error(
    "VERCEL: this is a private build, and what Vercel builds is deployed. Only the public edition is deployed: the build command must be `npm run build:public` (see vercel.json), which sets PUBLIC_BUILD=1 and inspects the result.",
  );
}

/*
  Every file under public/ is published as it is. The files meant to be are
  listed in public-files.json (none yet); the inspection that follows a public
  build reads the same list, on its own.
*/
function publicFilesAllowed(): readonly string[] {
  const policy: unknown = JSON.parse(readFileSync("public-files.json", "utf8"));
  const files = (policy as { files?: unknown }).files;
  if (!Array.isArray(files) || files.some((file) => typeof file !== "string")) {
    throw new Error('public-files.json must hold { "files": [ … ] }, a list of paths relative to public/.');
  }
  return files;
}
const PUBLIC_DIR = "public";
const REFERENCE_COVERS = "public/covers/reference";

function filesUnder(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? filesUnder(path, base) : [path.slice(base.length + 1)];
  });
}

if (publicBuild) {
  /*
    PUBLIC BUILD GUARD. A public build stops here, before anything is built,
    unless both hold:

      1. public/ holds only files meant to be published. Reference covers are
         not licensed, and whatever is in public/ ships with the site, whatever
         the data says: so the check is on the disk.
      2. every record has a sleeve of the archive's own to show in their place.
  */
  const allowed = publicFilesAllowed();
  const unexpected = filesUnder(PUBLIC_DIR).filter((file) => !allowed.includes(file));
  if (unexpected.length > 0) {
    throw new Error(
      `PUBLIC_BUILD: public/ holds ${unexpected.length} file(s) that must not be published: ${unexpected.slice(0, 12).join(", ")}${
        unexpected.length > 12 ? ", …" : ""
      }. A public build is made from a tree without them (a fresh clone has none); reference covers stay on the private machine only.`,
    );
  }

  const bare = records.filter((record) => {
    const sleeve = sleeveOf(record);
    return !sleeve || sleeve.tracks.length === 0 || sleeve.tracks.some((length) => !Number.isFinite(length) || length <= 0);
  });
  if (bare.length > 0) {
    throw new Error(
      `PUBLIC_BUILD: ${bare.length} record(s) have no sleeve of the archive's own to show: ${bare
        .map((record) => record.slug)
        .join(", ")}. A sleeve is drawn from a record's track listing (src/content/tracklists.ts).`,
    );
  }
}

/*
  Reference covers are local files that are never versioned, so a clone may
  not have them. In the private edition the names present are handed to the app
  when Next starts (content/music.ts, coverOf): a record whose file is missing
  shows the archive's sleeve, and nothing is requested that is not there. The
  public edition is handed none and does not look.
*/
const referenceCovers = !publicBuild && existsSync(REFERENCE_COVERS) ? readdirSync(REFERENCE_COVERS).join(",") : "";

/*
  WHAT EVERY ANSWER SAYS ABOUT ITSELF. The site is read, not signed in to: it
  has no form, no account, and asks nothing of any other address. The headers
  say so, to a browser that would otherwise have to assume the opposite.

  The policy allows what the site is made of and no more: its own scripts,
  styles, fonts and images. Two allowances are wider than one would like.
  Scripts written into the page ('unsafe-inline'): Next.js hands each page its
  data that way, and the pages are built once, ahead of time, so there is no
  request to make a nonce for. Styles written into the page: React sets them on
  elements as they move. The grain is an image written into the stylesheet
  (data:). Nothing here loads from another site, is shown inside another site,
  or is sent to one.

  The policy is left out of `next dev`, whose tooling evaluates code and keeps
  a socket open; the other headers are sent there too.
*/
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The same as frame-ancestors above, for a browser that does not read it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(process.env.NODE_ENV === "development" ? [] : [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Not said: which framework answers.
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // The public edition is built apart, and without server source maps: a map carries the source it was made from,
  // private blocks included.
  ...(publicBuild ? { distDir: ".next-public" } : {}),
  experimental: {
    // One 404 for the whole site (app/global-not-found.tsx). Each language has a root layout of its own, so there is
    // no single layout to make an unmatched address's page from: without this, that page has no language and no styles.
    globalNotFound: true,
    ...(publicBuild ? { serverSourceMaps: false } : {}),
  },
  env: { NEXT_PUBLIC_EDITION: edition, NEXT_PUBLIC_REFERENCE_COVERS: referenceCovers },
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
