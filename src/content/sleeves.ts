/**
 * PUBLIC SLEEVES — the archive's own artwork for a record.
 *
 * A sleeve is drawn by the project from a record's catalogue data and from
 * the lengths of its tracks. It is not the record's cover and takes nothing
 * from it: `MusicRecord.artwork` still says what is known about that cover,
 * and this layer is independent of it.
 *
 * The drawing is a function of this data alone (components/archive/
 * PublicSleeve): the same data always gives exactly the same sleeve.
 */
import type { MusicRecord } from "./music";
import { tracklists, type TracklistKey } from "./tracklists";

export type Sleeve = {
  /** Track lengths in seconds, in running order — read from the record's listing (content/tracklists.ts). */
  tracks: readonly number[];
};

const seconds = (length: string) => {
  const [m, s] = length.split(":").map(Number);
  return m * 60 + s;
};

/** The sleeve the archive draws for a record: any record whose running order is listed. */
export function sleeveOf(record: MusicRecord): Sleeve | null {
  const rows = tracklists[record.catalogue as TracklistKey];
  return rows ? { tracks: rows.map((row) => seconds(row[1])) } : null;
}
