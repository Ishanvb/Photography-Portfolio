// Refreshes src/content/fallback.json from the live site.
//
// fallback.json is the build-time snapshot the site renders from when
// /api/content is unreachable. Re-run this after significant content changes so
// the offline fallback does not drift from reality.
//
//   npm run snapshot -- https://your-domain.com
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const origin = process.argv[2];
if (!origin) {
  console.error('Usage: npm run snapshot -- https://your-domain.com');
  process.exit(1);
}

const res = await fetch(new URL('/api/content', origin));
if (!res.ok) {
  console.error(`Fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const data = await res.json();

if (!Array.isArray(data.projects) || data.projects.length === 0) {
  console.error('Refusing to write an empty manifest — the fallback would blank the site.');
  process.exit(1);
}

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content/fallback.json');
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log(
  `fallback.json updated — ${data.projects.length} projects, ` +
  `${data.projects.reduce((n, p) => n + (p.photos?.length ?? 0), 0)} photos, ` +
  `${data.reel?.length ?? 0} reel items`
);
