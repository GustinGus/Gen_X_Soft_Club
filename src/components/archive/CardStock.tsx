"use client";

import { useLayoutEffect } from "react";

/**
 * The deck is laid out from where the catalogue card's bottom edge rests
 * (RecordSheet.module.css, `--card-rest-bottom`). The stylesheet reserves a
 * card stock tall enough for every file; this hands it the card's real
 * height as `--card-stock`, so a card that outgrows the reserve (a narrower
 * screen, a longer entry) still stops above the deck's keys.
 *
 * Measured only while the card is at rest over the deck — set aside it is
 * laid out wider — and held through a cycle, so nothing moves under an
 * INSERT or an EJECT. Writes one custom property; never renders.
 */
export function CardStock({ cardId }: { cardId: string }) {
  useLayoutEffect(() => {
    const card = document.getElementById(cardId)?.closest("section");
    const sheet = card?.closest("article");
    if (!card || !sheet) return;

    let stock = 0;
    const observer = new ResizeObserver(([entry]) => {
      const deck = sheet.getAttribute("data-deck");
      if (deck !== null && deck !== "empty") return;
      const height = Math.ceil(entry.borderBoxSize[0].blockSize);
      if (height === stock) return;
      stock = height;
      sheet.style.setProperty("--card-stock", `${height}px`);
    });
    observer.observe(card);
    return () => {
      observer.disconnect();
      sheet.style.removeProperty("--card-stock");
    };
  }, [cardId]);

  return null;
}
