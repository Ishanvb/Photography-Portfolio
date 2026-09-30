/**
 * Smaller copies of the site's photos, cut on demand by Vercel's image
 * optimiser (configured under `images` in vercel.json).
 *
 * Every photo is stored at up to 2400px, which is right for the full-screen
 * views and far too much for a 22px square on the gallery belt or a quarter-
 * width tile on the Work page. The optimiser resizes once, caches the result
 * on the CDN, and picks AVIF or WebP per browser, so a <picture> with a WebP
 * <source> is not needed for these.
 *
 * `vite dev` has no optimiser, so there the original is returned unchanged.
 */

// Must match `images.sizes` in vercel.json — any other width is rejected.
export const WIDTHS = [96, 640, 1080];

/** For thumbnails a couple of dozen pixels across, like the gallery belt's. */
export const THUMB_WIDTH = WIDTHS[0];

const QUALITY = 80;

const enabled = !import.meta.env.DEV;

/** The photo at `width` pixels wide (one of WIDTHS), or the original. */
export const resized = (src, width) => {
  if (!enabled || !src) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`;
};

/** A srcset of every width up to and including `max`. */
export const resizedSrcSet = (src, max = WIDTHS[WIDTHS.length - 1]) => {
  if (!enabled || !src) return undefined;
  return WIDTHS.filter((w) => w <= max)
    .map((w) => `${resized(src, w)} ${w}w`)
    .join(', ');
};

/**
 * If the optimiser ever refuses a photo, fall back to the original rather than
 * leave a hole. Attach as an <img>'s onError.
 */
export const fallBackToOriginal = (original) => (event) => {
  const img = event.currentTarget;
  if (!original || img.dataset.fellBack) return;
  img.dataset.fellBack = 'true';
  img.removeAttribute('srcset');
  img.src = original;
};
