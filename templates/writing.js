import { html, raw } from '../lib/html.js';
import { formatDate, isoDate } from '../lib/dates.js';

// Its pieces of the stylesheet, in src/css/ (build.js joins them).
export const styles = ['lists.css', 'writing.css'];

export function post(site, post) {
  return html`
<article class="post">
  <header class="post-header">
    <p class="label"><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>${post.category ? html` · ${post.category}` : ''}</p>
    <h1>${post.title}</h1>
  </header>
  <div class="prose">${raw(post.html)}</div>
  <p class="more"><a href="/blog/">← All writing</a></p>
</article>`;
}

// /blog/: every post, newest first, grouped by year.
export function blogIndex(site, posts) {
  const years = Map.groupBy(posts, (p) => new Date(p.date).getFullYear());
  return html`
<article class="listing">
  <h1>Writing</h1>
  <p class="lede">Taking apart black boxes, in AI and elsewhere.</p>
  ${[...years].map(
    ([year, list]) => html`
  <h2 class="label">${year}</h2>
  <ul class="post-list post-list--long">
    ${list.map(
      (p) => html`<li>
      <time datetime="${isoDate(p.date)}">${formatDate(p.date)}</time>
      <a href="${p.url}">${p.title}</a>
      ${p.description ? html`<p>${p.description}</p>` : ''}
    </li>`,
    )}
  </ul>`,
  )}
</article>`;
}
