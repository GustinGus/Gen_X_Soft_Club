"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const never = () => () => {};

/**
 * After a client navigation the clicked link is gone and focus falls to
 * <body>. Hand it to the file's heading instead, so keyboard and screen
 * reader users land on the record they opened. Never scrolls.
 *
 * Only then. A file that arrives as a document — opened by its address,
 * reloaded, or reached by changing language — is left alone: focus stays
 * where the browser put it, so the first Tab finds the skip link and then the
 * folio, in order.
 *
 * The two are told apart by how this component came to be: a document the
 * server sent is hydrated, a file opened from another page of the site is
 * rendered here. Only hydration reads the server's snapshot below.
 */
export function SheetFocus({ targetId }: { targetId: string }) {
  const hydrating = useSyncExternalStore(
    never,
    () => false,
    () => true,
  );
  // The file this document was loaded as, if it was loaded as one: the heading of that file is not focused.
  const loadedAs = useRef(hydrating ? targetId : null);

  useEffect(() => {
    if (loadedAs.current === targetId) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    document.getElementById(targetId)?.focus({ preventScroll: true });
  }, [targetId]);

  return null;
}
