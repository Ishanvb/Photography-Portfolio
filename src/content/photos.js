/**
 * Every photo the site owns, in the order the opening transition consumes
 * them: the reel first — those are the tiles already on screen when the
 * gallery opens, so they are the ones that visibly shrink into the circle —
 * then every project photo, hero and cover. Deduped by source path.
 */
export const collectPhotos = ({ projects, reel }) => {
  const seen = new Set();
  const out = [];

  const push = (src, meta) => {
    if (!src?.jpg || seen.has(src.jpg)) return;
    seen.add(src.jpg);
    out.push({ jpg: src.jpg, webp: src.webp ?? null, ...meta });
  };

  reel.forEach((item) =>
    push(item, {
      title: item.title,
      subtitle: item.caption,
      project: projects.find((p) => p.slug === item.targetSlug)?.title ?? item.caption,
      slug: item.targetSlug ?? null,
      photoIndex: item.targetPhotoIndex ?? null,
      fromReel: true
    })
  );

  projects.forEach((project) => {
    (project.photos ?? []).forEach((photo, index) =>
      push(photo, {
        title: project.title,
        subtitle: photo.alt ?? `${project.title} ${index + 1}`,
        project: project.title,
        slug: project.slug,
        photoIndex: index,
        fromReel: false
      })
    );
    const projectMeta = {
      title: project.title,
      subtitle: project.description,
      project: project.title,
      slug: project.slug,
      photoIndex: null,
      fromReel: false
    };
    push(project.hero, projectMeta);
    push(project.cover, projectMeta);
  });

  return out;
};

/** jpg path -> naturalWidth / naturalHeight, for photos the browser has read. */
export const photoAspects = new Map();

/**
 * Warm the browser cache for a set of photos a few at a time, recording each
 * one's shape as it arrives. The gallery lays tiles out from their real aspect
 * ratios, so knowing them up front keeps the belt from re-flowing under the
 * pointer as images trickle in.
 */
export const preloadPhotos = (photos, onMeasured, lanes = 3) => {
  const queue = photos.filter((photo) => !photoAspects.has(photo.jpg));
  let index = 0;

  const next = () => {
    if (index >= queue.length) return;
    const photo = queue[index];
    index += 1;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight;
        photoAspects.set(photo.jpg, aspect);
        onMeasured?.(photo.jpg, aspect);
      }
      next();
    };
    img.onerror = next;
    img.src = photo.webp ?? photo.jpg;
  };

  for (let lane = 0; lane < lanes; lane += 1) next();
};
