import Image from "next/image";
import { ViewTransition } from "react";
import { JewelCase } from "@/components/editorial/Placeholders";
import { recordFileCopy as copy, type MusicRecord } from "@/content/music";
import styles from "./ArchiveSleeve.module.css";

type Props = {
  record: MusicRecord;
  /** "index": the object in its drawer. "file": the same object, out on the table. */
  variant?: "index" | "file";
  className?: string;
};

/**
 * THE OBJECT — one CD case per record, the same object wherever it appears.
 *
 * It owns the shared-element name: the case in a drawer (index / home) and
 * the case on the record file are one element to the browser, so opening a
 * file carries the object from the drawer to the table (and back).
 *
 * Artwork: placeholder → Phase 2A JewelCase (empty tray) + scan-pending marks
 * on the file. Licensed → the scan inside the same case, never cropped.
 * Either way the tray is `data-disc-home`: where the record's disc lies, and
 * where it leaves from for the deck.
 */
export function ArchiveSleeve({ record, variant = "index", className }: Props) {
  const { artwork } = record;

  return (
    <ViewTransition name={`sleeve-${record.slug}`} share="sleeve-morph" default="none">
      <div className={[styles.sleeve, className].filter(Boolean).join(" ")} data-variant={variant}>
        {artwork.status === "licensed" ? (
          <figure className={styles.licensed}>
            <span className={styles.hinge} aria-hidden="true" />
            <span className={styles.tray} data-disc-home="">
              <Image
                src={artwork.src}
                alt={`Cover of ${record.album} by ${record.artist}`}
                fill
                sizes={variant === "file" ? "(max-width: 699px) 80vw, 40vw" : "(max-width: 699px) 80vw, 25vw"}
              />
            </span>
            {variant === "file" && (
              <figcaption className={styles.credit}>
                {artwork.credit} — {artwork.source}
              </figcaption>
            )}
          </figure>
        ) : (
          <>
            <JewelCase artist={record.artist} album={record.album} catalogue={record.catalogue} />
            {variant === "file" && (
              /* Scanner-bed marks laid over the empty tray: material awaiting digitisation. */
              <span className={styles.scan} aria-hidden="true">
                <span className={styles.reg} data-corner="tl" />
                <span className={styles.reg} data-corner="tr" />
                <span className={styles.reg} data-corner="bl" />
                <span className={styles.reg} data-corner="br" />
                <span className={styles.stamp}>{copy.artworkPending}</span>
              </span>
            )}
          </>
        )}
      </div>
    </ViewTransition>
  );
}
