"use client";

import Link from "next/link";
import { useId, useRef, useState, type CSSProperties } from "react";
import {
  artistsIn,
  frequencies,
  frequenciesCopy as copy,
  type FrequencyId,
} from "@/content/music";
import { useReveal } from "@/motion/useReveal";
import styles from "./Frequencies.module.css";

/**
 * FREQUENCIES — the listening index, printed like a booklet page.
 *
 * Tuning, not hovering: pointer / focus previews a station, click / Enter /
 * Space tunes it. The tuner needle glides to the station, the room's
 * atmosphere crossfades (opacity only) and the other stations dim.
 * Nothing is hidden behind the interaction — artists and atmosphere words
 * are always printed. On touch, each station carries its own atmosphere.
 */
export function Frequencies() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, 0.15);

  const [preview, setPreview] = useState<FrequencyId | null>(null);
  const [tuned, setTuned] = useState<FrequencyId | null>(null);
  const station = preview ?? tuned;
  const index = station ? frequencies.findIndex((f) => f.id === station) : -1;
  const active = index >= 0 ? frequencies[index] : null;
  const tunedFrequency = frequencies.find((f) => f.id === tuned);
  const uid = useId();

  return (
    <section
      ref={ref}
      id="frequencies"
      className={styles.frequencies}
      aria-labelledby="frequencies-title"
      data-station={station ?? "none"}
    >
      {/*
        ATMOSPHERES — abstract, CSS-only art direction (no photography yet).
        Stand-ins for curated imagery in a later phase.
      */}
      <div className={styles.atmospheres} aria-hidden="true">
        {frequencies.map((f) => (
          <span key={f.id} className={styles.atmosphere} data-atmosphere={f.id} />
        ))}
      </div>

      <header className={styles.head}>
        <p className={styles.label}>ARCHIVE_002 / {copy.label}</p>
        <h2 id="frequencies-title" className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.note}>{copy.note}</p>
      </header>

      <div
        className={styles.tuner}
        aria-hidden="true"
        style={{ "--station": index >= 0 ? (index + 0.5) / frequencies.length : 0 } as CSSProperties}
      >
        <span className={styles.tunerLabel}>
          <span className={styles.tunerKey}>{copy.tuner}</span>
          <span>{active ? `${active.code} — ${active.name}` : copy.idle}</span>
        </span>
        <span className={styles.scale}>
          {frequencies.map((f) => (
            <span key={f.id} className={styles.tick} data-on={f.id === station || undefined}>
              {f.code}
            </span>
          ))}
          <span className={styles.needle} data-idle={index < 0 || undefined}>
            <span />
          </span>
        </span>
      </div>

      <ol className={styles.stations} onPointerLeave={() => setPreview(null)}>
        {frequencies.map((f, i) => {
          const metaId = `${uid}-${f.id}`;
          const artists = artistsIn(f.id);
          return (
            <li
              key={f.id}
              className={styles.station}
              data-id={f.id}
              data-dim={(station !== null && station !== f.id) || undefined}
              style={{ "--row": i } as CSSProperties}
            >
              <span className={styles.stationAtmosphere} data-atmosphere={f.id} aria-hidden="true" />
              <button
                type="button"
                className={styles.tune}
                aria-pressed={tuned === f.id}
                aria-describedby={metaId}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(f.id)}
                onFocus={() => setPreview(f.id)}
                onBlur={() => setPreview(null)}
                onClick={() => setTuned((t) => (t === f.id ? null : f.id))}
              >
                <span className={styles.code}>{f.code}</span>{" "}
                <span className={styles.name}>{f.name}</span>
              </button>
              <div id={metaId} className={styles.meta}>
                <p className={styles.artists}>{artists.join(" / ")}</p>
                <p className={styles.atmosphereWords}>{f.atmosphere.join(" · ")}</p>
                {f.status === "open" && f.href ? (
                  <Link className={styles.open} href={f.href}>
                    {copy.open} <span aria-hidden="true">{f.href.startsWith("#") ? "↓" : "→"}</span>
                  </Link>
                ) : (
                  <p className={styles.pending}>{copy.inPreparation}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="visually-hidden" role="status" aria-live="polite">
        {tunedFrequency ? `Tuned to ${tunedFrequency.code} ${tunedFrequency.name}` : ""}
      </p>
    </section>
  );
}
