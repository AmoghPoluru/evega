import sharp from "sharp";

export interface ExtractedPalette {
  dominantColor: string;
  palette: string[];
}

export async function extractPaletteFromBuffer(buffer: Buffer): Promise<ExtractedPalette> {
  const { dominant, channels } = await sharp(buffer)
    .resize(64, 64, { fit: "inside" })
    .stats();

  const dominantColor = rgbToHex(
    Math.round(dominant.r),
    Math.round(dominant.g),
    Math.round(dominant.b),
  );

  const palette = channels.slice(0, 5).map((c) =>
    rgbToHex(Math.round(c.mean), Math.round(c.mean), Math.round(c.mean)),
  );

  return {
    dominantColor,
    palette: palette.length > 0 ? palette : [dominantColor],
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
