import type { Metadata } from "next";
import { ArchiveIndex } from "@/components/archive/ArchiveIndex";

export const metadata: Metadata = {
  title: "ARCHIVE_002 — Listening index — Soft Club Archive",
  description: "Twelve records filed under four frequencies: After Hours, Soft Future, City Frequency, Alternative Signal.",
};

export default function MusicIndexPage() {
  return <ArchiveIndex />;
}
