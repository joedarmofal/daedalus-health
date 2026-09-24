import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(dir, "../public/images/winged-figure-source.jpg");
const output = path.resolve(dir, "../public/images/winged-figure.png");

const img = sharp(input).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Sample background color from the four corners (avoids the figure in the center).
const sampleAt = (x, y) => {
  const idx = (y * width + x) * channels;
  return [data[idx], data[idx + 1], data[idx + 2]];
};
const corners = [
  sampleAt(2, 2),
  sampleAt(width - 3, 2),
  sampleAt(2, height - 3),
  sampleAt(width - 3, height - 3),
];
const bg = [0, 1, 2].map(
  (c) => corners.reduce((sum, corner) => sum + corner[c], 0) / corners.length,
);

console.log("Sampled background color:", bg.map((v) => Math.round(v)));

const dist = (r, g, b) =>
  Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);

const innerThreshold = 22; // fully transparent below this distance
const outerThreshold = 60; // fully opaque above this distance

for (let i = 0; i < width * height; i++) {
  const idx = i * channels;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const d = dist(r, g, b);
  let alpha;
  if (d <= innerThreshold) {
    alpha = 0;
  } else if (d >= outerThreshold) {
    alpha = 255;
  } else {
    alpha = Math.round(
      ((d - innerThreshold) / (outerThreshold - innerThreshold)) * 255,
    );
  }
  data[idx + 3] = alpha;
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(output);

console.log("Wrote", output);
