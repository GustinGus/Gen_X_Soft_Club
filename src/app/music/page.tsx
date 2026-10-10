import type { Metadata } from "next";
import { ArchiveIndex } from "@/components/archive/ArchiveIndex";
import { archiveIndex, frequencies, records } from "@/content/music";
import { getDictionary } from "@/i18n/dictionary";
import { countWord, fill } from "@/i18n/format";
import { defaultLocale } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getDictionary(defaultLocale);
  return {
    title: fill(copy.meta.index.title, { archive: archiveIndex.archive }),
    // counted and named from the catalogue, never typed
    description: fill(copy.meta.index.description, {
      records: countWord(copy, records.length),
      frequencies: countWord(copy, frequencies.length).toLowerCase(),
      names: frequencies.map((f) => f.name).join(", "),
    }),
  };
}

export default async function MusicIndexPage() {
  return <ArchiveIndex copy={await getDictionary(defaultLocale)} />;
}
