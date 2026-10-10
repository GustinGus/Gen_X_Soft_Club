import type { Dictionary } from "./dictionary";

/**
 * A dictionary sentence with its values in place: fill("Tuned to {code}", { code: "01" }).
 * A mark with no value is left as written, so a missing one shows instead of vanishing.
 */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (mark, key: string) => (key in values ? String(values[key]) : mark));
}

/** A count as a word in the dictionary's language; past its list, the figure. */
export function countWord(copy: Pick<Dictionary, "countWords">, n: number): string {
  return copy.countWords[n] ?? String(n);
}
