import { html, raw } from '../lib/html.js';

// Prerender same-site pages when a link is hovered, so clicking one feels
// instant (Chromium browsers; others simply ignore this).
const speculationRules = JSON.stringify({
  prerender: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }],
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
<link rel="icon" href="/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/atom+xml" title="${site.title}" href="/feed.xml">
<link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${site.assets['style.css']}">
${page.hasMath ? html`<link rel="stylesheet" href="/katex/katex.min.css">` : ''}
<script type="speculationrules">${raw(speculationRules)}</script>
<script type="module" src="${site.assets['board/main.js']}"></script>
${page.scripts?.map((src) => html`<script type="module" src="${site.assets[src]}"></script>`)}
${site.production && site.analytics
  ? html`<script defer src="${site.analytics.src}" data-website-id="${site.analytics.websiteId}"></script>`
  : ''}
</head>
<body class="${page.bodyClass ?? ''}">
<!-- Chalk, for the blackboard (dark mode): fractal noise turned into a grain of
     tiny gaps, then used to let only part of what's drawn show through.
     style.css applies it to handwriting; src/board/paint.js to chalk you draw. -->
<svg class="filters" aria-hidden="true" focusable="false">
  <filter id="chalk" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.1" result="grain"/>
    <feComposite in="SourceGraphic" in2="grain" operator="in"/>
  </filter>
</svg>
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
