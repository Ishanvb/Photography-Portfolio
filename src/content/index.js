import fallback from './fallback.json';

/**
 * The site's content manifest.
 *
 * Fetched once at module load — kicked off as the bundle parses, in parallel
 * with the <link rel="preload"> in index.html, so it is not a waterfall behind
 * the JS.
 *
 * The page does not wait on it for long. /api/content is fast from the CDN but
 * can take a couple of seconds when the cache has lapsed (a cold function plus
 * the database), and every photo URL on the site comes from it — so waiting
 * meant the loading screen sat there with nothing downloading. Instead:
 *
 *   - `contentReady` resolves with fresh data if it arrives within
 *     WAIT_FOR_FRESH_MS, and otherwise with the best copy already on hand:
 *     the last manifest this browser saw, or the build-time snapshot in
 *     fallback.json. useContent() suspends on it, reusing the LoadingScreen
 *     already wired up in App.jsx.
 *   - Whenever fresh data does land and differs, the store updates and every
 *     useContent() caller re-renders with it.
 *
 * Nothing here ever rejects, so the site is never blank because of a database
 * problem.
 */
const isUsable = (data) => Array.isArray(data?.projects) && data.projects.length > 0;

const WAIT_FOR_FRESH_MS = 400;
const TIMEOUT_MS = 8000;
const CACHE_KEY = 'mp-content';

const readCache = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY));
    return isUsable(data) ? data : null;
  } catch {
    return null;
  }
};

const writeCache = (json) => {
  try {
    localStorage.setItem(CACHE_KEY, json);
  } catch {
    // Private mode or full storage: the snapshot still covers the next visit.
  }
};

let current = readCache() ?? fallback;
let currentJson = JSON.stringify(current);
const listeners = new Set();

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getContent = () => current;

// Default credentials, not 'omit': the preload in index.html is
// crossorigin="anonymous" (same-origin credentials), and a fetch whose mode
// differs cannot reuse it — the browser would download the manifest twice.
const fresh = fetch('/api/content', { signal: AbortSignal.timeout?.(TIMEOUT_MS) })
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (!isUsable(data)) return;
    const json = JSON.stringify(data);
    writeCache(json);
    if (json === currentJson) return;
    current = data;
    currentJson = json;
    listeners.forEach((listener) => listener());
  })
  .catch(() => {});

export const contentReady = Promise.race([
  fresh,
  new Promise((resolve) => setTimeout(resolve, WAIT_FOR_FRESH_MS)),
]);

export { fallback };
