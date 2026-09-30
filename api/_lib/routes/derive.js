import crypto from 'node:crypto';
import sharp from 'sharp';
import { encodePhoto } from '../encode.js';
import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, PHOTO_BUCKET, unwrap } from '../db.js';

// 2400px on the long edge for gallery images, 1200px for reel thumbnails, each
// encoded within the site's file-size budget (see encode.js).
const PRESETS = {
  gallery: { maxEdge: 2400 },
  reel: { maxEdge: 1200 },
};

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!(await requireSession(req, res))) return;

  const { path, folder = 'uploads', preset = 'gallery' } = req.body ?? {};
  if (!path?.startsWith('originals/')) {
    return json(res, 400, { error: 'Invalid upload path' });
  }
  const { maxEdge } = PRESETS[preset] ?? PRESETS.gallery;
  const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '') || 'uploads';

  const bucket = db.storage.from(PHOTO_BUCKET);

  const blob = unwrap(await bucket.download(path));
  const input = Buffer.from(await blob.arrayBuffer());

  const { jpeg: jpegBuf, webp: webpBuf } = await encodePhoto(input, maxEdge);
  const meta = await sharp(jpegBuf).metadata();

  const id = crypto.randomUUID();
  const jpgPath = `${safeFolder}/${id}.jpg`;
  const webpPath = `${safeFolder}/${id}.webp`;
  const opts = { cacheControl: '31536000', contentType: undefined, upsert: false };

  unwrap(await bucket.upload(jpgPath, jpegBuf, { ...opts, contentType: 'image/jpeg' }));
  unwrap(await bucket.upload(webpPath, webpBuf, { ...opts, contentType: 'image/webp' }));

  // The original was only a staging artefact; drop it so storage does not grow
  // by a full-resolution copy of every upload.
  await bucket.remove([path]);

  json(res, 200, {
    jpg: bucket.getPublicUrl(jpgPath).data.publicUrl,
    webp: bucket.getPublicUrl(webpPath).data.publicUrl,
    width: meta.width,
    height: meta.height,
  });
});
