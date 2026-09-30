import { json, methodGuard, withErrors } from './_lib/http.js';
import { db, unwrap } from './_lib/db.js';

// Served through Vercel's CDN. A publish becomes visible within s-maxage;
// stale-while-revalidate means visitors never wait on the database.
const CACHE = 'public, s-maxage=60, stale-while-revalidate=600';

const img = (jpg, webp) => (jpg ? { jpg, webp: webp ?? null } : null);

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['GET'])) return;

  const projects = unwrap(
    await db
      .from('projects')
      .select(`
        slug, title, description, date_label,
        hero_jpg, hero_webp, cover_jpg, cover_webp,
        sort_order,
        photos ( url_jpg, url_webp, youtube_id, alt, caption, width, height, sort_order )
      `)
      .eq('published', true)
      .order('sort_order', { ascending: true })
  );

  const reel = unwrap(
    await db
      .from('reel_items')
      .select('url_jpg, url_webp, title, target_slug, target_photo_index, is_narrow')
      .order('sort_order', { ascending: true })
  );

  // The About page: one row of copy, and the two ordered lists beside it.
  const aboutRow = unwrap(
    await db.from('about').select('intro, body').eq('id', 1).maybeSingle()
  );
  const aboutLines = unwrap(
    await db.from('about_lines').select('kind, text, sort_order').order('sort_order', { ascending: true })
  );

  const body = {
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      dateLabel: p.date_label ?? '',
      hero: img(p.hero_jpg, p.hero_webp),
      cover: img(p.cover_jpg, p.cover_webp),
      photos: (p.photos ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ph) => ({
          jpg: ph.url_jpg,
          webp: ph.url_webp,
          youtubeId: ph.youtube_id,
          alt: ph.alt,
          caption: ph.caption ?? '',
          width: ph.width,
          height: ph.height,
        })),
    })),
    about: {
      intro: aboutRow?.intro ?? '',
      body: aboutRow?.body ?? '',
      bio: aboutLines.filter((l) => l.kind === 'bio').map((l) => l.text),
      work: aboutLines.filter((l) => l.kind === 'work').map((l) => l.text),
    },
    reel: reel.map((r) => ({
      jpg: r.url_jpg,
      webp: r.url_webp,
      title: r.title,
      targetSlug: r.target_slug,
      targetPhotoIndex: r.target_photo_index,
      isNarrow: r.is_narrow,
    })),
  };

  res.setHeader('Cache-Control', CACHE);
  json(res, 200, body);
});
