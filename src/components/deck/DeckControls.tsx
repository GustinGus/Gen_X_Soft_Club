"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { canEject, canInsert, type DeckState } from "./deckMachine";
import styles from "./DeckControls.module.css";

type Props = {
  state: DeckState;
  onInsert?: () => void;
  onEject?: () => void;
  /** The keys' group name, in the page's language. */
  label: string;
  /** What each key does, said after its lettering where the page is not in the lettering's language; empty where it is. */
  actions: { insert: string; eject: string };
  /** The language of the keys' own lettering, where the page is in another. */
  lettering?: string;
  className?: string;
};

/**
 * Two keys, nothing else. Native buttons with visible labels, so they work
 * without the custom cursor. No play key: nothing can be played.
 *
 * The lettering is the unit's own and is the same in every language. Where
 * the page is in another, a key's name keeps its lettering (what is seen is
 * what is said) and adds what the key does, in the page's language.
 *
 * Focus follows the machine: when the key in use goes dead (INSERT once
 * the disc is taken, EJECT once it is out), focus moves to the live key —
 * or holds on the panel while neither is live — instead of dropping to the
 * page. Only while the user is working the keys.
 */
export function DeckControls({ state, onInsert, onEject, label, actions, lettering, className }: Props) {
  const group = useRef<HTMLDivElement>(null);
  const insert = useRef<HTMLButtonElement>(null);
  const eject = useRef<HTMLButtonElement>(null);
  const inUse = useRef(false);

  // Working the keys ends when the user goes elsewhere.
  useEffect(() => {
    const away = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) inUse.current = false;
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, []);

  useLayoutEffect(() => {
    const panel = group.current;
    if (!inUse.current || !panel) return;
    const active = document.activeElement;
    // Dropped to the page, left on a dead key, or held on the panel while no key was live.
    const lost =
      !active ||
      active === document.body ||
      active === panel ||
      (panel.contains(active) && (active as HTMLButtonElement).disabled);
    if (!lost) return;
    const live = [insert.current, eject.current].find((key) => key && !key.disabled);
    (live ?? panel).focus({ preventScroll: true });
  }, [state]);

  return (
    <div
      ref={group}
      className={[styles.controls, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
      tabIndex={-1}
      onFocus={() => (inUse.current = true)}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) inUse.current = false;
      }}
    >
      <button ref={insert} type="button" className={styles.key} disabled={!canInsert(state)} onClick={onInsert}>
        <span className={styles.glyph} aria-hidden="true">
          ▸
        </span>
        <span lang={lettering}>Insert disc</span>
        {actions.insert ? <span className="visually-hidden">{` — ${actions.insert}`}</span> : null}
      </button>
      <button ref={eject} type="button" className={styles.key} disabled={!canEject(state)} onClick={onEject}>
        <span className={styles.glyph} data-glyph="eject" aria-hidden="true" />
        <span lang={lettering}>Eject</span>
        {actions.eject ? <span className="visually-hidden">{` — ${actions.eject}`}</span> : null}
      </button>
    </div>
  );
}
