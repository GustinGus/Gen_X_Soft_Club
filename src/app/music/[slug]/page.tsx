import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { RecordSheet } from "@/components/archive/RecordSheet";
import { archiveIndex, frequencyOf, recordBySlug, records } from "@/content/music";
import { fileFor } from "@/content/records";
import { getDictionary } from "@/i18n/dictionary";
import { fill } from "@/i18n/format";
import { defaultLocale } from "@/i18n/locales";

/** The archive is closed: twelve files, nothing generated on demand. */
export const dynamicParams = false;

export function generateStaticParams() {
  return records.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/music/[slug]">): Promise<Metadata> {
  const record = recordBySlug((await params).slug);
  if (!record) return {};
  const frequency = frequencyOf(record.frequency);
  const { meta } = await getDictionary(defaultLocale);
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

export default async function RecordPage({ params }: PageProps<"/music/[slug]">) {
  const { slug } = await params;
  const record = recordBySlug(slug);
  const file = record && fileFor(record.catalogue);
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
        <RecordSheet record={record} file={file} copy={await getDictionary(defaultLocale)} />
      </main>
    </ViewTransition>
  );
}
