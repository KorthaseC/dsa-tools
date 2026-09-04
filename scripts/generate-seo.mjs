// Generates robots.txt + sitemap.xml into src/seo/, from where angular.json copies them to the
// deployment ROOT (not /assets — that was the old bug: robots.txt advertised /sitemap.xml, but the
// file only ever existed at /assets/sitemap.xml, so the SPA fallback answered with HTML instead).
//
// Runs as the `prebuild` step of `npm run build:prod`.
//
// Drift guard: every path in APP_ROUTES must appear in either PAGES or EXCLUDED below. Add a route
// without deciding whether it belongs in the sitemap and this script fails the build.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://dsa-tools.de';
const OUT_DIR = join(ROOT, 'src', 'seo');

// Indexable pages. `loc` is relative to SITE_URL; '' is the home page.
const PAGES = [
  { loc: '', lastmod: '2026-08-25', priority: '1.0', changefreq: 'monthly' },
  { loc: '/overview', lastmod: '2026-08-25', priority: '0.9', changefreq: 'monthly' },
  { loc: '/character', lastmod: '2026-08-25', priority: '0.9', changefreq: 'monthly' },
  { loc: '/calendar', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/currency', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/alchemy', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/tavern', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/names', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/smith', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/books', lastmod: '2026-08-25', priority: '0.8', changefreq: 'yearly' },
  { loc: '/token', lastmod: '2026-08-25', priority: '0.7', changefreq: 'yearly' },
  { loc: '/legal', lastmod: '2026-08-25', priority: '0.4', changefreq: 'yearly' },
  { loc: '/imprint', lastmod: '2026-08-25', priority: '0.4', changefreq: 'yearly' },
];

// Deliberately kept out of the sitemap; these carry <meta name="robots" content="noindex,follow">.
const EXCLUDED = {
  '/about': 'redirects to / (the home page renders the same component)',
  '/report': 'contact form, noindex',
  '/character-creator': 'empty without a character in progress, noindex',
  '/character-sheet': 'empty without a character in progress, noindex',
};

function appRoutePaths() {
  const src = readFileSync(join(ROOT, 'src', 'app', 'app.constants.ts'), 'utf8');
  const block = src.match(/export const APP_ROUTES = \{([\s\S]*?)\} as const;/);
  if (!block) throw new Error('Could not locate APP_ROUTES in src/app/app.constants.ts');
  return [...block[1].matchAll(/'(\/[^']*)'/g)].map((m) => m[1]);
}

function assertNoDrift() {
  const known = new Set([...PAGES.map((p) => p.loc || '/'), ...Object.keys(EXCLUDED)]);
  const missing = appRoutePaths().filter((p) => !known.has(p));
  if (missing.length) {
    throw new Error(
      `Route(s) missing from the sitemap config: ${missing.join(', ')}\n` +
        `Add them to PAGES or EXCLUDED in scripts/generate-seo.mjs.`
    );
  }
}

function sitemap() {
  const urls = PAGES.map(
    (p) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${p.loc}${p.loc === '' ? '/' : ''}</loc>\n` +
      `    <lastmod>${p.lastmod}</lastmod>\n` +
      `    <changefreq>${p.changefreq}</changefreq>\n` +
      `    <priority>${p.priority}</priority>\n` +
      `  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robots() {
  return [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${SITE_URL}/sitemap.xml`, ``].join('\n');
}

assertNoDrift();
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap(), 'utf8');
writeFileSync(join(OUT_DIR, 'robots.txt'), robots(), 'utf8');
console.log(`Erfolg: sitemap.xml (${PAGES.length} URLs) und robots.txt in src/seo/ erzeugt.`);
