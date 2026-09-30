import sharp from 'sharp';

/**
 * Encode a photo to JPEG and WebP within a file-size budget.
 *
 * Every photo aims for 400 KB or less in each format. The encoder tries the
 * best quality first and steps down; if even the lowest quality we accept is
 * over budget (grainy, detailed shots), it takes the long edge down a notch
 * and tries again, never below MIN_EDGE — about what the collection pop-up
 * shows on a Retina screen. Whatever it ends on, the ICC profile is kept so
 * colours survive the round trip.
 *
 * Shared by the admin upload (routes/derive.js) and scripts/compress-photos.mjs,
 * so photos shipped with the site and photos uploaded later come out alike.
 */

export const BUDGET = 400 * 1024;
const MIN_EDGE = 1800;
const EDGE_STEP = 0.9;

const JPEG_QUALITIES = [90, 86, 82, 78, 75, 72];
const WEBP_QUALITIES = [85, 82, 78, 75, 72];

const jpegAt = (quality) => ({
  quality,
  // Full-resolution colour while there is room for it; halved once quality
  // has to come down anyway, where it saves far more than it costs.
  chromaSubsampling: quality >= 86 ? '4:4:4' : '4:2:0',
  mozjpeg: true,
});

// smartSubsample is sharp's equivalent of cwebp's -sharp_yuv.
const webpAt = (quality) => ({ quality, smartSubsample: true });

const pipeline = (input, edge) =>
  sharp(input, { failOn: 'none' })
    .rotate() // bake in EXIF orientation
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
    .withMetadata(); // keeps the ICC profile

async function fit(input, maxEdge, qualities, encode) {
  let edge = maxEdge;
  let smallest = null;
  for (;;) {
    for (const quality of qualities) {
      const buffer = await encode(pipeline(input, edge), quality);
      if (!smallest || buffer.length < smallest.length) smallest = buffer;
      if (buffer.length <= BUDGET) return buffer;
    }
    if (edge <= MIN_EDGE) return smallest;
    edge = Math.max(MIN_EDGE, Math.round(edge * EDGE_STEP));
  }
}

/** { jpeg, webp } buffers for `input`, no larger than `maxEdge` on the long side. */
export async function encodePhoto(input, maxEdge) {
  const [jpeg, webp] = await Promise.all([
    fit(input, maxEdge, JPEG_QUALITIES, (p, q) => p.jpeg(jpegAt(q)).toBuffer()),
    fit(input, maxEdge, WEBP_QUALITIES, (p, q) => p.webp(webpAt(q)).toBuffer()),
  ]);
  return { jpeg, webp };
}
