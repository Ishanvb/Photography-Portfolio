import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, unwrap } from '../db.js';

/**
 * The About page's copy and the two lists beside it.
 *
 *   GET                       everything, for the admin to render
 *   PATCH { intro?, body? }   the paragraph — the highlighted opening sentence
 *                             and the rest of it
 *   POST  { kind, text }      add a line to the biography or the work list
 *   PATCH { id, text }        edit one line
 *   PATCH { kind, order[] }   reorder one list
 *   DELETE { id }             remove a line
 *
 * The paragraph lives in a single row, pinned to id 1 by a check constraint, so
 * there is never a second one to choose between.
 */
const KINDS = ['bio', 'work'];

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['GET', 'POST', 'PATCH', 'DELETE'])) return;
  if (!(await requireSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const about = unwrap(
      await db.from('about').select('intro, body').eq('id', 1).maybeSingle()
    );
    const lines = unwrap(
      await db.from('about_lines').select('id, kind, text, sort_order')
        .order('sort_order', { ascending: true })
    );
    return json(res, 200, { about: about ?? { intro: '', body: '' }, lines });
  }

  if (req.method === 'POST') {
    const { kind, text = '' } = req.body ?? {};
    if (!KINDS.includes(kind)) return json(res, 400, { error: 'Unknown list' });

    const { data: last } = await db
      .from('about_lines').select('sort_order')
      .eq('kind', kind)
      .order('sort_order', { ascending: false })
      .limit(1).maybeSingle();

    const created = unwrap(
      await db.from('about_lines')
        .insert({ kind, text, sort_order: (last?.sort_order ?? -1) + 1 })
        .select().single()
    );
    return json(res, 200, { line: created });
  }

  if (req.method === 'PATCH') {
    // Reordering one list arrives as an array of ids and carries no single id.
    if (Array.isArray(req.body?.order)) {
      await Promise.all(
        req.body.order.map((id, i) =>
          db.from('about_lines').update({ sort_order: i }).eq('id', id)
        )
      );
      return json(res, 200, { ok: true });
    }

    // One line's text.
    if (req.body?.id) {
      const updated = unwrap(
        await db.from('about_lines')
          .update({ text: req.body.text ?? '' })
          .eq('id', req.body.id).select().single()
      );
      return json(res, 200, { line: updated });
    }

    // Otherwise the paragraph. Only what was sent is written, so saving one
    // half never blanks the other.
    const patch = {};
    if (req.body?.intro !== undefined) patch.intro = req.body.intro ?? '';
    if (req.body?.body !== undefined) patch.body = req.body.body ?? '';
    if (!Object.keys(patch).length) return json(res, 400, { error: 'nothing to update' });
    patch.updated_at = new Date().toISOString();

    const saved = unwrap(
      await db.from('about').upsert({ id: 1, ...patch }).select().single()
    );
    return json(res, 200, { about: saved });
  }

  const id = req.body?.id;
  if (!id) return json(res, 400, { error: 'id required' });
  unwrap(await db.from('about_lines').delete().eq('id', id).select());
  json(res, 200, { ok: true });
});
