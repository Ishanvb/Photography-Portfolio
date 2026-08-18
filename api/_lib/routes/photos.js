import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, PHOTO_BUCKET, unwrap } from '../db.js';

/**
 * If a URL points at our own Supabase bucket, return the object path so the
 * file can be deleted alongside the row. Legacy /photos/... paths live in the
 * git repo and are left untouched.
 */
function storagePath(url) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${PHOTO_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST', 'PATCH', 'DELETE'])) return;
  if (!(await requireSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST') {
    const { projectId, jpg, webp, youtubeId, alt = '', width, height } = req.body ?? {};
    if (!projectId) return json(res, 400, { error: 'projectId required' });
    if (!jpg && !youtubeId) return json(res, 400, { error: 'An image or a YouTube id is required' });

    const { data: last } = await db
      .from('photos').select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1).maybeSingle();

    const created = unwrap(
      await db.from('photos').insert({
        project_id: projectId,
        url_jpg: jpg ?? null,
        url_webp: webp ?? null,
        youtube_id: youtubeId ?? null,
        alt,
        width: width ?? null,
        height: height ?? null,
        sort_order: (last?.sort_order ?? -1) + 1,
      }).select().single()
    );
    return json(res, 200, { photo: created });
  }

  if (req.method === 'PATCH') {
    if (Array.isArray(req.body?.order)) {
      await Promise.all(
        req.body.order.map((id, i) => db.from('photos').update({ sort_order: i }).eq('id', id))
      );
      return json(res, 200, { ok: true });
    }
    const { id, alt } = req.body ?? {};
    if (!id) return json(res, 400, { error: 'id required' });
    const updated = unwrap(
      await db.from('photos').update({ alt: alt ?? '' }).eq('id', id).select().single()
    );
    return json(res, 200, { photo: updated });
  }

  const id = req.body?.id;
  if (!id) return json(res, 400, { error: 'id required' });

  const rows = unwrap(await db.from('photos').select('url_jpg, url_webp').eq('id', id));
  unwrap(await db.from('photos').delete().eq('id', id).select());

  const paths = rows.flatMap((r) => [storagePath(r.url_jpg), storagePath(r.url_webp)]).filter(Boolean);
  if (paths.length) await db.storage.from(PHOTO_BUCKET).remove(paths);

  json(res, 200, { ok: true });
});
