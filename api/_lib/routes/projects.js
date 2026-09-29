import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, unwrap } from '../db.js';

const slugify = (s) =>
  String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(base) {
  const taken = new Set(
    unwrap(await db.from('projects').select('slug')).map((r) => r.slug)
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

// Only what the site actually reads. count_label, body_text, title_offset and
// media_kind belonged to the per-project page that no longer exists; the
// columns are left in the database so nothing written into them is lost.
const COLUMNS = {
  title: 'title',
  description: 'description',
  dateLabel: 'date_label',
  heroJpg: 'hero_jpg',
  heroWebp: 'hero_webp',
  coverJpg: 'cover_jpg',
  coverWebp: 'cover_webp',
  sortOrder: 'sort_order',
  published: 'published',
};

function toRow(body) {
  const row = {};
  for (const [key, column] of Object.entries(COLUMNS)) {
    if (body[key] !== undefined) row[column] = body[key];
  }
  return row;
}

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'DELETE'])) return;
  if (!(await requireSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const rows = unwrap(
      await db
        .from('projects')
        .select('*, photos(id, url_jpg, url_webp, youtube_id, alt, caption, sort_order)')
        .order('sort_order', { ascending: true })
    );
    return json(res, 200, { projects: rows });
  }

  if (req.method === 'POST') {
    const title = String(req.body?.title ?? '').trim();
    if (!title) return json(res, 400, { error: 'Title is required' });

    const slug = await uniqueSlug(req.body?.slug ? slugify(req.body.slug) : slugify(title));
    const { data: maxRow } = await db
      .from('projects').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();

    const row = {
      slug,
      title,
      sort_order: (maxRow?.sort_order ?? 0) + 1,
      // New projects stay hidden until she explicitly publishes them.
      published: false,
      ...toRow(req.body ?? {}),
    };
    const created = unwrap(await db.from('projects').insert(row).select().single());
    return json(res, 200, { project: created });
  }

  if (req.method === 'PATCH') {
    // Reordering the whole list arrives as an array of ids and carries no single id.
    if (Array.isArray(req.body?.order)) {
      await Promise.all(
        req.body.order.map((pid, i) =>
          db.from('projects').update({ sort_order: i + 1 }).eq('id', pid)
        )
      );
      return json(res, 200, { ok: true });
    }

    const id = req.body?.id;
    if (!id) return json(res, 400, { error: 'id required' });

    const row = { ...toRow(req.body), updated_at: new Date().toISOString() };
    const updated = unwrap(await db.from('projects').update(row).eq('id', id).select().single());
    return json(res, 200, { project: updated });
  }

  const id = req.body?.id;
  if (!id) return json(res, 400, { error: 'id required' });
  unwrap(await db.from('projects').delete().eq('id', id).select());
  json(res, 200, { ok: true });
});
