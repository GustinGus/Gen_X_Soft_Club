"use client";

import { useEffect } from "react";

/**
 * After a client navigation the clicked link is gone and focus falls to
 * <body>. Hand it to the file's heading instead, so keyboard and screen
 * reader users land on the record they opened. Never scrolls.
 */
export function SheetFocus({ targetId }: { targetId: string }) {
  useEffect(() => {
    const active = document.activeElement;
    if (active && active !== document.body) return;
    document.getElementById(targetId)?.focus({ preventScroll: true });
  }, [targetId]);

  return null;
}
