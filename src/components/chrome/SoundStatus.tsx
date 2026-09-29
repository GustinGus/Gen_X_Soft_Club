"use client";

import { useSound } from "@/audio/SoundProvider";
import styles from "./SoundStatus.module.css";

/**
 * Discreet transport readout, top-right on every page. A status, not a
 * control: it becomes a real mute/pause button when the player exists.
 */
export function SoundStatus() {
  const { available, muted } = useSound();
  return (
    <p className={styles.status}>
      <span className={styles.meter} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span>Sound</span>
      <span className={styles.value}>{muted ? "Muted" : "On"}</span>
      {!available && <span className="visually-hidden">— player arrives in a later issue</span>}
    </p>
  );
}
