import { resized, THUMB_WIDTH, webpOf } from '~/content/imageUrl';
import photoShapes from '~/content/photoShapes.json';

/**
 * A project's collection: every photo the Work page shows for it, in the order
 * the collection pop-up stacks them. The project's own photos first, then its
 * hero if that is a separate file — appended, not prepended, so the reel's
 * `targetPhotoIndex` (an index into project.photos) still lands on the same
 * photo.
 *
 * The Work grid and CollectionModal must both build from this. When they built
 * their lists separately the grid showed the hero but the pop-up did not, so a
 * click on the hero opened the collection on photo 01 instead.
 */
export const collectionOf = (project) => {
  const photos = project?.photos ?? [];
  const hero = project?.hero;
  if (!hero?.jpg || photos.some((photo) => photo.jpg === hero.jpg)) return photos;
  return [...photos, { jpg: hero.jpg, webp: hero.webp ?? null, alt: project.title, caption: '' }];
};

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
      subtitle: item.title,
      project: projects.find((p) => p.slug === item.targetSlug)?.title ?? item.title,
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

/**
 * jpg path -> width / height. Starts out knowing every photo shipped in
 * public/photos (measured at build time by scripts/photo-shapes.mjs); anything
 * else is learned as the browser reads it, or from the database's own width
 * and height (see rememberShapes).
 */
export const photoAspects = new Map(Object.entries(photoShapes));

/** Take the shape of every photo whose width and height are already known. */
export const rememberShapes = (photos) => {
  photos.forEach((photo) => {
    if (photo?.jpg && photo.width && photo.height && !photoAspects.has(photo.jpg)) {
      photoAspects.set(photo.jpg, photo.width / photo.height);
    }
  });
};

/**
 * Learn every photo's shape a few at a time, from the same small copy the
 * gallery belt shows — so this also fills the belt, without pulling down every
 * full-size file on the site. The gallery lays tiles out from their real aspect
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
    img.onerror = () => {
      // Optimiser unavailable: measure the original instead.
      img.onerror = next;
      img.src = webpOf(photo);
    };
    img.src = resized(webpOf(photo), THUMB_WIDTH);
  };

  for (let lane = 0; lane < lanes; lane += 1) next();
};
