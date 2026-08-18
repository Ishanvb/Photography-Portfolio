import crypto from 'node:crypto';
import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, PHOTO_BUCKET, unwrap } from '../db.js';

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff', 'heic']);

/**
 * Hands back a short-lived signed URL so the browser can PUT the original
 * straight to Supabase Storage. This deliberately bypasses Vercel, whose 4.5MB
 * request body cap would reject most full-resolution photographs.
 */
export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;
  if (!(await requireSession(req, res))) return;

  const filename = String(req.body?.filename ?? '');
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return json(res, 400, { error: `Unsupported file type: .${ext ?? '?'}` });
  }

  const path = `originals/${crypto.randomUUID()}.${ext}`;
  const data = unwrap(await db.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path));

  json(res, 200, { uploadUrl: data.signedUrl, path });
});
