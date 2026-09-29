"use client";

import type { MouseEvent } from "react";
import styles from "./EnterButton.module.css";

type Props = {
  label: string;
  /** Called on activation; if omitted the link simply jumps to #manifesto. */
  onEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * ENTER THE CLUB. A real link to #manifesto, so it works with no JS, by
 * keyboard (Enter) and for assistive tech; JS upgrades it to the cinematic shot.
 * Styled like a transit sign panel, not a pill.
 */
export function EnterButton({ label, onEnter }: Props) {
  return (
    <a
      className={styles.enter}
      href="#manifesto"
      data-cursor="enter"
      onClick={onEnter}
    >
      <span className={styles.fill} aria-hidden="true" />
      <span className={styles.index} aria-hidden="true">
        01
      </span>
      <span className={styles.label}>{label}</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </a>
  );
}
