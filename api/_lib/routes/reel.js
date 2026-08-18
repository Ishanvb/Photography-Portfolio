import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, unwrap } from '../db.js';

const COLUMNS = {
  jpg: 'url_jpg',
  webp: 'url_webp',
  title: 'title',
  caption: 'caption',
  targetSlug: 'target_slug',
  targetPhotoIndex: 'target_photo_index',
  isNarrow: 'is_narrow',
};

const toRow = (body) =>
  Object.fromEntries(
    Object.entries(COLUMNS)
      .filter(([key]) => body[key] !== undefined)
      .map(([key, column]) => [column, body[key]])
  );

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'DELETE'])) return;
  if (!(await requireSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const rows = unwrap(
      await db.from('reel_items').select('*').order('sort_order', { ascending: true })
    );
    return json(res, 200, { reel: rows });
  }

  if (req.method === 'POST') {
    if (!req.body?.jpg) return json(res, 400, { error: 'An image is required' });
    const { data: last } = await db
      .from('reel_items').select('sort_order')
      .order('sort_order', { ascending: false }).limit(1).maybeSingle();

    const created = unwrap(
      await db.from('reel_items')
        .insert({ ...toRow(req.body), sort_order: (last?.sort_order ?? -1) + 1 })
        .select().single()
    );
    return json(res, 200, { item: created });
  }

  if (req.method === 'PATCH') {
    if (Array.isArray(req.body?.order)) {
      await Promise.all(
        req.body.order.map((id, i) => db.from('reel_items').update({ sort_order: i }).eq('id', id))
      );
      return json(res, 200, { ok: true });
    }
    const id = req.body?.id;
    if (!id) return json(res, 400, { error: 'id required' });
    const updated = unwrap(
      await db.from('reel_items').update(toRow(req.body)).eq('id', id).select().single()
    );
    return json(res, 200, { item: updated });
  }

  const id = req.body?.id;
  if (!id) return json(res, 400, { error: 'id required' });
  unwrap(await db.from('reel_items').delete().eq('id', id).select());
  json(res, 200, { ok: true });
});
