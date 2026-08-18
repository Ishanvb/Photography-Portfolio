import fallback from './fallback.json';

/**
 * The site's content manifest.
 *
 * Fetched once at module load — kicked off as the bundle parses, in parallel
 * with the <link rel="preload"> in index.html, so it is not a waterfall behind
 * the JS. Components read it via useContent(), which suspends on this promise
 * and therefore reuses the LoadingScreen already wired up in App.jsx.
 *
 * The promise never rejects. If the API is unreachable or returns nothing
 * usable, the build-time snapshot in fallback.json takes over, so the site is
 * never blank because of a database problem.
 */
const isUsable = (data) => Array.isArray(data?.projects) && data.projects.length > 0;

export const contentPromise = fetch('/api/content', { credentials: 'omit' })
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => (isUsable(data) ? data : fallback))
  .catch(() => fallback);

export { fallback };
