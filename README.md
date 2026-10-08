# Gen X Soft Club

A digital archive of sound, fashion and image.

## Two editions

The project builds in two ways, and only one of them is meant to be published.

- **Private** (the default: `npm run dev`, `npm run build`) — for study on one machine. A record shows a reference copy of its cover when that file is on the machine, and the archive's own sleeve when it is not.
- **Public** (`npm run build:public`) — the edition that can be published. Every record shows the archive's own sleeve. No cover is used, read or shipped.

## Cover artwork

A record's cover has one of three states (`src/content/music.ts`):

- `placeholder` — no cover is held.
- `reference` — a copy of the cover kept on this machine for private study. **It is not licensed.** It grants no right to redistribute the image.
- `licensed` — a cover used with documented permission.

`reference` does not mean `licensed`, and the two are never mixed.

Apart from that, the archive draws a sleeve of its own for every record (`src/content/sleeves.ts`, `src/components/archive/PublicSleeve.tsx`). A sleeve is original artwork made from the record's catalogue data and the lengths of its tracks (`src/content/tracklists.ts`). It is not the record's cover and takes nothing from it.

### Reference copies stay out of Git

Reference copies live in `public/covers/reference/`. That folder is ignored by Git and is never committed: the repository is public, and committing the files would publish them.

A clone of the repository does not have these files. It builds and runs normally, and every record shows the archive's sleeve.

Where each reference copy came from, which edition it is and when it was retrieved is recorded in `src/content/music.ts`, in a block marked private. That block is versioned, and it is left out of a public build.

## Public build

```bash
npm run build:public
```

This is the only way to build the public edition. It sets `PUBLIC_BUILD=1`, builds into `.next-public` (emptied first), and then inspects the result. It fails, and leaves no build behind, unless all of the following hold:

1. **`public/` holds nothing that is not meant to be published.** Everything in `public/` ships with the site, so the check is on the disk. The files meant to be published are listed in `public-files.json` (none yet); anything else stops the build. With the reference covers present the build stops: a public build is made from a tree without them, such as a fresh clone.
2. **Every record has a sleeve.**
3. **The result holds no image and no private artwork data.** `scripts/verify-public-build.mjs` reads every built file: none may be an image, whatever its name, and none may carry anything from the private blocks of `src/content/music.ts` (paths, sources, editions, captions).
4. **Every record's page, the index and the home are there and show sleeves**, and none asks for an image.

`PUBLIC_BUILD` is the only switch. `NEXT_PUBLIC_EDITION`, which the app reads, is set from it by `next.config.ts`; setting it by hand stops the build.

`npm run verify:public` runs the inspection again on an existing `.next-public`.

The build's cache (`.next-public/cache`) is not part of what is published. The inspection reads it for the private texts as well, but a cache is a binary store, and finding nothing there in plain text does not prove it holds nothing in another encoding: a cache is never published.

When the inspection passes it leaves `public-edition-verified.json` in the build, with the `BUILD_ID` it inspected. That file is a record of the inspection, not a safeguard: a build changed afterwards is no longer the build it describes.

### Deploying (Vercel)

`vercel.json` makes Vercel build with `npm run build:public` and take `.next-public` as the output, so a deployment is the public edition, inspected, or it fails. On top of that:

- `next.config.ts` refuses a private build wherever `VERCEL=1` is set: what Vercel builds is deployed. Other CI is not concerned, and can build and test the private edition.
- `.vercelignore` keeps the reference covers and local builds from being uploaded when deploying from a machine with the Vercel CLI. It is a second line of defence: the build itself stops if those files are in the tree.

### Before any publication

1. Build with `npm run build:public`, from a tree that does not hold the reference covers, and publish only what that command produced.
2. Never publish a private build (`.next`): it refers to the reference covers, and its image cache holds reduced copies of them.
3. Confirm the folder was never committed: `git log --all -- public/covers/` prints nothing.
