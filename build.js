// Builds the whole site into dist/. Run `npm run build` (or `npm run dev`).
//
//   content/   what the site says: Markdown and YAML
//   templates/ how it's laid out: functions that return HTML
//   src/       CSS and the one small script, fingerprinted for caching
//   public/    copied as-is (fonts, images, video)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import config from './site.config.js';
import { loadCollection } from './lib/content.js';
import { layout } from './templates/layout.js';
import { home } from './templates/home.js';
import { project } from './templates/project.js';
import { projectsIndex } from './templates/projects.js';
import { post, blogIndex } from './templates/writing.js';
import { page, redirect } from './templates/page.js';
import { feed, sitemap, robots } from './templates/feeds.js';

const started = performance.now();
const OUT = 'dist';
const production = !process.argv.includes('--dev');

// Retries: on Windows a file can be briefly locked (say, a video the dev server is streaming).
fs.rmSync(OUT, { recursive: true, force: true, maxRetries: 5 });
fs.cpSync('public', OUT, { recursive: true });

// --- Assets: src/style.css → /style.3f9a1c2b.css, so browsers can cache it forever.
const assets = {};
for (const file of fs.readdirSync('src')) {
  const contents = fs.readFileSync(path.join('src', file));
  const hash = crypto.createHash('sha256').update(contents).digest('hex').slice(0, 8);
  const name = file.replace(/\.(\w+)$/, `.${hash}.$1`);
  fs.writeFileSync(path.join(OUT, name), contents);
  assets[file] = `/${name}`;
}
const site = { ...config, assets, production };

// --- Content
const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
const posts = loadCollection('content/writing', { urlPrefix: '/blog' }).sort(byDateDesc);
const projects = loadCollection('content/projects', { urlPrefix: '/projects' }).sort(
  (a, b) => (a.featured ?? Infinity) - (b.featured ?? Infinity),
);
const pages = loadCollection('content/pages', { urlPrefix: '' });
const homeData = YAML.parse(fs.readFileSync('content/home.yml', 'utf8'));
const archive = YAML.parse(fs.readFileSync('content/archive.yml', 'utf8'));

// --- Pages. Each one is written to <url>/index.html, so URLs end in a slash.
const written = [];
function write(url, contents, { inSitemap = true } = {}) {
  const file = url.endsWith('/') ? path.join(OUT, url, 'index.html') : path.join(OUT, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(contents));
  if (inSitemap && url.endsWith('/')) written.push(url);
}

write(
  '/',
  layout(site, { url: '/', bodyClass: 'is-home', scripts: ['aside.js'] },
    home(site, { home: homeData, featured: projects.filter((p) => p.featured), posts })),
);

for (const p of projects) {
  write(p.url, layout(site, { url: p.url, title: p.title, description: p.summary }, project(site, p)));
}
write('/projects/', layout(site, { url: '/projects/', title: 'Projects', bodyClass: 'is-wide' }, projectsIndex(site, projects, archive)));

for (const p of posts) {
  write(p.url, layout(site, { url: p.url, title: p.title, description: p.description, type: 'post', hasMath: p.hasMath }, post(site, p)));
}
write('/blog/', layout(site, { url: '/blog/', title: 'Writing' }, blogIndex(site, posts)));

for (const p of pages) {
  const url = p.permalink ?? p.url;
  write(url, layout(site, { url, title: p.title, description: p.description }, page(site, p)), { inSitemap: url.endsWith('/') });
}

for (const [from, to] of Object.entries(site.redirects)) {
  write(from, redirect(site, to), { inSitemap: false });
}

write('/feed.xml', feed(site, posts));
write('/sitemap.xml', sitemap(site, written));
write('/robots.txt', robots(site));

// KaTeX's stylesheet and fonts, only if some page has math.
if ([...posts, ...projects, ...pages].some((item) => item.hasMath)) {
  fs.cpSync('node_modules/katex/dist/katex.min.css', path.join(OUT, 'katex/katex.min.css'));
  fs.cpSync('node_modules/katex/dist/fonts', path.join(OUT, 'katex/fonts'), {
    recursive: true,
    filter: (src) => !/\.(ttf|woff)$/.test(src), // every browser we care about takes woff2
  });
}

// --- Report
const yamlTodos = (file) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/#\s*TODO:?\s*(.*)/g)].map((m) => `${file}: ${m[1]}`);
const allTodos = [
  ...yamlTodos('content/home.yml'),
  ...yamlTodos('content/archive.yml'),
  ...[...projects, ...posts, ...pages].flatMap((item) => item.todos.map((todo) => `${item.file}: ${todo}`)),
];

console.log(`Built ${written.length} pages in ${Math.round(performance.now() - started)}ms${production ? '' : ' (dev)'}`);
if (allTodos.length) console.log(`\n${allTodos.length} TODOs:\n${allTodos.map((t) => `  - ${t}`).join('\n')}`);

// Draft copy must never go live by accident: a production build (which is
// what deploys) fails while TODOs remain, unless explicitly overridden.
if (production && allTodos.length && !process.argv.includes('--allow-todos')) {
  console.error('\nProduction build stopped: resolve the TODOs above, or run `node build.js --allow-todos`.');
  process.exit(1);
}
