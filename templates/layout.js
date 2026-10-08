import { html, raw } from '../lib/html.js';

// Prerender same-site pages when a link is hovered, so clicking one feels
// instant (Chromium browsers; others simply ignore this). Links that open in
// the homepage aside are skipped: aside.js fetches those itself.
const speculationRules = JSON.stringify({
  prerender: [
    {
      where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[data-aside]' } }] },
      eagerness: 'moderate',
    },
  ],
});

// Every page goes through this. `page` describes the page itself;
// `site` is site.config.js plus a few things the build adds (like asset URLs).
export function layout(site, page, content) {
  const title = page.title ? `${page.title} · ${site.title}` : site.title;
  const description = page.description ?? site.description;
  const canonical = new URL(page.url, site.url).href;

  return html`<!doctype html>
<!--
  Hi, curious person. This page was built by a small script, not a framework:
  build.js reads Markdown from content/, runs it through templates/, and writes plain HTML.
  It's all readable here: https://github.com/adntaha/adntaha.github.io
  More on how it's made at /colophon/.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="${page.title ?? site.title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${page.type === 'post' ? 'article' : 'website'}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="${site.title}" href="/feed.xml">
<link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${site.assets['style.css']}">
${page.hasMath ? html`<link rel="stylesheet" href="/katex/katex.min.css">` : ''}
<script type="speculationrules">${raw(speculationRules)}</script>
${page.scripts?.map((src) => html`<script type="module" src="${site.assets[src]}"></script>`)}
${page.url === '/' ? '' : html`<script>
  // If this page was reached by reloading inside the homepage's project panel, Back
  // only changes the URL; nothing would re-render. Load the page it now points to.
  const here = location.pathname;
  addEventListener('popstate', () => location.pathname !== here && location.reload());
</script>`}
${site.production && site.analytics
  ? html`<script defer src="${site.analytics.src}" data-website-id="${site.analytics.websiteId}"></script>`
  : ''}
</head>
<body class="${page.bodyClass ?? ''}">
<a class="skip-link" href="#main">Skip to content</a>
${page.url === '/' ? '' : html`<header class="site-header"><a href="/" class="site-name">${site.title}</a>
<nav><a href="/projects/">Projects</a> <a href="/blog/">Writing</a></nav></header>`}
<main id="main">
${content}
</main>
<footer class="site-footer">
<p>${site.elsewhere.map((link, i) => html`${i ? ' · ' : ''}<a href="${link.url}">${link.label}</a>`)} · <a href="/feed.xml">RSS</a></p>
<p class="quiet">${site.location} · <a href="/colophon/">How this site is made</a></p>
</footer>
</body>
</html>
`;
}
