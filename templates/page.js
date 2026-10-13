import { html, raw } from '../lib/html.js';

// Its pieces of the stylesheet, in src/css/ (build.js joins them).
export const styles = ['writing.css'];

// Plain pages from content/pages/: the colophon, the 404 page.
export function page(site, page) {
  return html`
<article class="post">
  <header class="post-header"><h1>${page.title}</h1></header>
  <div class="prose">${raw(page.html)}</div>
</article>`;
}

// For old URLs that moved. GitHub Pages can't send real redirects, so this
// is the standard static fallback: an instant refresh plus a canonical link.
export function redirect(site, to) {
  return html`<!doctype html>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${new URL(to, site.url).href}">
<meta http-equiv="refresh" content="0; url=${to}">
<p>This page moved to <a href="${to}">${to}</a>.</p>
`;
}
