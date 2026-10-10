import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArchiveIndex } from "@/components/archive/ArchiveIndex";
import { RecordSheet } from "@/components/archive/RecordSheet";
import { archiveIndex, frequencies, frequencyOf, recordBySlug, records } from "@/content/music";
import { fileFor } from "@/content/records";
import { getDictionary } from "@/i18n/dictionary";
import { countWord, fill } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { getRecordTexts } from "@/i18n/records";

/*
  THE SITE'S PAGES, ONCE.

  Every language has the same pages: the home, the listening index, a file per
  record. The route files of each language (app/(en), app/pt-br) only say
  which language they are and call what is here. These are functions that
  return a page's tree, not components wrapped around it: a route renders
  exactly what it rendered when it was written out in full.
*/

// ---------------------------------------------------------------- /music

export async function indexMetadata(locale: Locale): Promise<Metadata> {
  const copy = await getDictionary(locale);
  return {
    title: fill(copy.meta.index.title, { archive: archiveIndex.archive }),
    // counted and named from the catalogue, never typed
    description: fill(copy.meta.index.description, {
      records: countWord(copy, records.length),
      frequencies: countWord(copy, frequencies.length, "feminine").toLowerCase(),
      names: frequencies.map((f) => f.name).join(", "),
    }),
  };
}

export async function indexPage(locale: Locale) {
  return <ArchiveIndex locale={locale} copy={await getDictionary(locale)} />;
}

// ---------------------------------------------------------------- /music/[slug]

/** The archive is closed: a file per record, in every language, and nothing else. */
export function recordParams() {
  return records.map((r) => ({ slug: r.slug }));
}

export async function recordMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const record = recordBySlug(slug);
  if (!record) return {};
  const frequency = frequencyOf(record.frequency);
  const { meta } = await getDictionary(locale);
  return {
    title: fill(meta.record.title, { artist: record.artist, album: record.album, catalogue: record.catalogue }),
    description: fill(meta.record.description, {
      archive: archiveIndex.archive,
      code: frequency.code,
      frequency: frequency.name,
      artist: record.artist,
      album: record.album,
      year: record.year,
    }),
  };
}

export async function recordPage(locale: Locale, slug: string) {
  const record = recordBySlug(slug);
  // the record's data, given the page's language: only a record's page reads the record texts
  const file = record && fileFor(record.catalogue, await getRecordTexts(locale), locale);
  if (!record || !file) notFound();

  /*
    Leafing between files: the whole file slides the way you leafed (types
    set by the file tabs). Every other navigation leaves this boundary
    inert, so the case's shared-element morph plays alone. It must be the
    page's outermost node: React only runs enter / exit on a boundary that
    comes before any DOM node of the inserted / removed tree.
  */
  return (
    <ViewTransition
      key={slug}
      enter={{ "file-next": "file-in-next", "file-prev": "file-in-prev", default: "none" }}
      exit={{ "file-next": "file-out-next", "file-prev": "file-out-prev", default: "none" }}
      default="none"
    >
      <main>
        <RecordSheet record={record} file={file} locale={locale} copy={await getDictionary(locale)} />
      </main>
    </ViewTransition>
  );
}
