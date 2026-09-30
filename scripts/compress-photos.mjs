/**
 * Re-encodes every photo under public/photos within the site's file-size
 * budget (400 KB per file; see api/_lib/encode.js), rewriting each .jpg and
 * its .webp beside it. A file that is already within budget is left alone, so
 * this is safe to run again. Afterwards run `node scripts/photo-shapes.mjs` if
 * any photo changed shape (it will not, unless the source was re-cropped).
 *
 *   node scripts/compress-photos.mjs
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { BUDGET, encodePhoto } from '../api/_lib/encode.js';

const photosDir = path.resolve(import.meta.dirname, '..', 'public', 'photos');
const MAX_EDGE = 2400;
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const jpgs = (await readdir(photosDir, { recursive: true })).filter((f) => /\.jpe?g$/i.test(f)).sort();

for (const file of jpgs) {
  const jpgPath = path.join(photosDir, file);
  const webpPath = jpgPath.replace(/\.jpe?g$/i, '.webp');
  const hasWebp = existsSync(webpPath);
  const before = [(await stat(jpgPath)).size, hasWebp ? (await stat(webpPath)).size : 0];
  if (before[0] <= BUDGET && before[1] <= BUDGET) continue;

  // Always from the JPEG: it is the fuller-quality source of the two.
  const { jpeg, webp } = await encodePhoto(await readFile(jpgPath), MAX_EDGE);
  if (jpeg.length < before[0]) await writeFile(jpgPath, jpeg);
  if (hasWebp && webp.length < before[1]) await writeFile(webpPath, webp);
  console.log(`${file}: ${kb(before[0])} → ${kb(Math.min(jpeg.length, before[0]))}` +
    (hasWebp ? `, webp ${kb(before[1])} → ${kb(Math.min(webp.length, before[1]))}` : ''));
}
