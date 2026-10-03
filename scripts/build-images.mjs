// Image prep. Run with `npm run images`.
// 1. Byline headshot: head-and-shoulders crop of Pete's cut-out portrait on the slate ground.
// 2. Banner + 2025 family photo.
// 3. Migrated WordPress uploads: recompress in place (same paths/URLs), capped at 1600px wide.
import sharp from 'sharp';
import { readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;

// 1. Headshot (portrait is 1365x2048; the head sits in the top ~45%).
const SLATE = '#395165';
for (const size of [160, 320]) {
  const crop = await sharp(`${ROOT}source-assets/pete-pearson-portrait.png`)
    .extract({ left: 232, top: 40, width: 900, height: 900 })
    .resize(size, size)
    .toBuffer();
  const img = sharp({ create: { width: size, height: size, channels: 4, background: SLATE } })
    .composite([{ input: crop }]);
  await img.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${ROOT}public/assets/img/pete-pearson-headshot-${size}.jpg`);
  await img.clone().webp({ quality: 80 }).toFile(`${ROOT}public/assets/img/pete-pearson-headshot-${size}.webp`);
}

// Blog banner (the old site's header photo) and the 2025 family photo for the About page.
await sharp(`${ROOT}source-assets/kidinjurylaw-banner.jpg`).jpeg({ quality: 82, mozjpeg: true }).toFile(`${ROOT}public/assets/img/kidinjurylaw-banner.jpg`);
await sharp(`${ROOT}source-assets/kidinjurylaw-banner.jpg`).webp({ quality: 80 }).toFile(`${ROOT}public/assets/img/kidinjurylaw-banner.webp`);
await sharp(`${ROOT}source-assets/pearson-family-2025.jpg`).rotate().resize({ width: 1600 }).jpeg({ quality: 80, mozjpeg: true })
  .toFile(`${ROOT}public/assets/img/pearson-family-2025.jpg`);

// 2. Recompress uploads in place.
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else yield p;
  }
}
let before = 0, after = 0;
for await (const file of walk(`${ROOT}public/wp-content/uploads`)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  let pipe = sharp(input).rotate();
  if ((meta.width ?? 0) > 1600) pipe = pipe.resize({ width: 1600 });
  const out = /\.png$/i.test(file)
    ? await pipe.png({ palette: true, quality: 85, effort: 10 }).toBuffer()
    : await pipe.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  before += input.length;
  if (out.length < input.length * 0.95) { await writeFile(file, out); after += out.length; } else after += input.length;
}
console.log(`uploads: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
