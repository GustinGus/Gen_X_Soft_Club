import type { Dictionary } from "./dictionary";
import type { Locale } from "./locales";

/**
 * A dictionary sentence with its values in place: fill("Tuned to {code}", { code: "01" }).
 * A mark with no value is left as written, so a missing one shows instead of vanishing.
 */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (mark, key: string) => (key in values ? String(values[key]) : mark));
}

/**
 * A count as a word in the dictionary's language; past its list, the figure.
 * `counted` is the gender of what is being counted, where the language has
 * one: records are counted in the masculine, frequencies in the feminine.
 */
export function countWord(copy: Pick<Dictionary, "countWords" | "countWordsFeminine">, n: number, counted: "masculine" | "feminine" = "masculine"): string {
  return (counted === "feminine" ? copy.countWordsFeminine : copy.countWords)[n] ?? String(n);
}

/** How each language writes a date out. English as the archive's records are dated: day, month, year. */
const DATE_LOCALE: Record<Locale, string> = { en: "en-GB", "pt-br": "pt-BR" };

/**
 * A documented date, written out in a language — only as precisely as it is
 * known: "1994" stays a year, "1994-08" a month and a year, "1994-08-22" a day.
 * Nothing is filled in. A date that does not exist is a mistake, not a text.
 */
export function formatDate(date: string, locale: Locale): string {
  const parts = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date);
  if (!parts) throw new Error(`"${date}" is not a date as the records write them (YYYY, YYYY-MM or YYYY-MM-DD).`);
  const [year, month, day] = [Number(parts[1]), parts[2] ? Number(parts[2]) : undefined, parts[3] ? Number(parts[3]) : undefined];
  const moment = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  if (moment.getUTCFullYear() !== year || moment.getUTCMonth() !== (month ?? 1) - 1 || moment.getUTCDate() !== (day ?? 1)) {
    throw new Error(`"${date}" is not a day of the calendar.`);
  }
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    timeZone: "UTC",
    year: "numeric",
    ...(month ? { month: "long" } : {}),
    ...(day ? { day: "numeric" } : {}),
  }).format(moment);
}
