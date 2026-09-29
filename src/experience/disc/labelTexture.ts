import { CanvasTexture, SRGBColorSpace } from "three";
import { DISC } from "./discGeometry";

/**
 * Printed label for the procedural disc — drawn once to a canvas.
 * Identity text only (issue / catalogue number); no invented release data.
 * Uses the same mono face as the DOM metadata so the object and the page
 * read as one printed system.
 */
export function createLabelTexture(monoFamily: string, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const unit = size / 2; // disc radius 1 → half the canvas

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#171a18";
  ctx.textBaseline = "middle";

  // Ring text around the outer edge, like a matrix / rim print.
  const ring = "SOFT CLUB ARCHIVE   ·   ISSUE 001   ·   SOUND / FASHION / IMAGE   ·   SC—001   ·   ";
  const ringRadius = (DISC.dataOuter - 0.045) * unit;
  ctx.font = `500 ${Math.round(size * 0.0165)}px ${monoFamily}`;
  const chars = [...ring];
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.translate(c + Math.cos(a) * ringRadius, c + Math.sin(a) * ringRadius);
    ctx.rotate(a + Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // Hub print: catalogue number + a thin registration rule.
  ctx.textAlign = "center";
  ctx.font = `500 ${Math.round(size * 0.02)}px ${monoFamily}`;
  ctx.fillText("SC—001", c, c - DISC.stackOuter * unit - size * 0.028);
  ctx.font = `400 ${Math.round(size * 0.013)}px ${monoFamily}`;
  ctx.fillText("GEN X SOFT CLUB", c, c + DISC.stackOuter * unit + size * 0.026);

  ctx.strokeStyle = "rgba(23, 26, 24, 0.55)";
  ctx.lineWidth = size * 0.0012;
  ctx.beginPath();
  ctx.arc(c, c, (DISC.dataInner + 0.012) * unit, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
