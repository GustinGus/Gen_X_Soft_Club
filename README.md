# Gen X Soft Club

A private, educational project: a digital archive of sound, fashion and image. It is not published.

## Cover artwork

A record's cover has one of three states (`src/content/music.ts`):

- `placeholder` — the empty case. No image.
- `reference` — a copy of the cover kept on this machine for private study. **It is not licensed.** It grants no right to redistribute the image.
- `licensed` — a cover used with documented permission.

`reference` does not mean `licensed`, and the two are never mixed.

### Reference copies stay out of Git

Reference copies live in `public/covers/reference/`. That folder is ignored by Git and is never committed: the repository is public, and committing the files would publish them.

A clone of the repository does not have these files. It builds and runs normally, and every record whose file is missing shows its placeholder.

Each `reference` record keeps where its copy came from, which edition it is and when it was retrieved, in `src/content/music.ts`. On the record's page the cover is described as a reference copy, not licensed, under Notes & sources.

### Public build check

A public build must not be produced while any record is still `reference`. Building with `PUBLIC_BUILD=1` fails and names those records:

```bash
PUBLIC_BUILD=1 npm run build
```

```powershell
$env:PUBLIC_BUILD = "1"; npm run build
```

The check reads the data, not the disk: a `reference` record fails the build whether or not its file is present. A normal private build (`npm run build`) is not affected.

### Before any publication

1. Run the public build check and read the list of records it names.
2. For each one, either obtain permission and make it `licensed`, with the permission documented, or return it to `placeholder`.
3. Delete `public/covers/reference/`.
4. Confirm that no `status: "reference"` remains in `src/content/music.ts` and that the folder was never committed (`git log --all -- public/covers/reference/` prints nothing).
