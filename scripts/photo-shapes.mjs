/**
 * Writes src/content/photoShapes.json: the aspect ratio of every photo under
 * public/photos, keyed by the path the site uses for it ("/photos/…/x.jpg").
 *
 * The Work grid deals photos into columns by height, so it needs every shape
 * before it can lay anything out. Photos uploaded through the admin carry their
 * width and height in the database; the ones shipped in public/photos did not,
 * and the page used to hold the whole grid back while it downloaded a copy of
 * each just to measure it. Run before every build (see package.json).
 */
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const photosDir = path.join(root, 'public', 'photos');
const out = path.join(root, 'src', 'content', 'photoShapes.json');

const files = (await readdir(photosDir, { recursive: true }))
  .filter((file) => /\.jpe?g$/i.test(file))
  .sort();

const shapes = {};
for (const file of files) {
  const { width, height, orientation } = await sharp(path.join(photosDir, file)).metadata();
  if (!width || !height) continue;
  // EXIF orientations 5–8 are turned a quarter, so the browser shows them on
  // their side relative to the stored pixels.
  const turned = orientation >= 5;
  const aspect = turned ? height / width : width / height;
  shapes[`/photos/${file.split(path.sep).join('/')}`] = Math.round(aspect * 10000) / 10000;
}

await writeFile(out, `${JSON.stringify(shapes, null, 2)}\n`);
console.log(`photo-shapes: ${Object.keys(shapes).length} photos`);
