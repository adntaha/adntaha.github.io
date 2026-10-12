import { html, raw } from '../lib/html.js';
import { renderInline, marginNote, readNote } from '../lib/markdown.js';
import { formatDate, isoDate } from '../lib/dates.js';
import { mediaSize } from '../lib/media.js';
import { projectRow } from './work.js';
import { messyStar, messyArrow } from './doodles.js';

const md = (text) => raw(renderInline(text));

// One line of "Now" or "Previously": where, then what.
const entry = (item) => html`<li><strong>${md(item.where)}</strong> <span>${md(item.what)}</span>${note(item.note)}</li>`;

function portrait({ src, alt }) {
  const size = mediaSize(`public${src}`);
  return html`<img class="portrait" src="${src}" alt="${alt}"${size ? html` width="${size.width}" height="${size.height}"` : ''}>`;
}
const note = (value, id) => {
  const { text, side } = readNote(value);
  return text ? raw(marginNote(renderInline(text), id, side)) : '';
};

// A note in the right margin beside a post in "Writing" comes with a doodled
// arrow from the note back to the post's title. The arrow stretches to fill
// the gap, so it's in two parts: the shaft stretches, the head keeps its
// shape. The post's file name seeds the wobble, so each arrow is a little
// different. (A note in the left margin sits right by the date; no arrow.)
function postNote(post, value) {
  const { text, side } = readNote(value);
  if (!text) return '';
  if (side === 'left') return note(value, `mn-home-${post.slug}`);
  const seed = [...post.slug].reduce((sum, c) => sum * 31 + c.charCodeAt(0), 7) | 0;
  const { head, shaft } = messyArrow(seed);
  return html`<span class="post-arrow" aria-hidden="true">
    <svg class="doodle post-arrow-shaft" viewBox="0 0 100 24" preserveAspectRatio="none" focusable="false"><path d="${shaft}"/></svg>
    <svg class="doodle post-arrow-head" viewBox="0 0 14 24" focusable="false"><path d="${head}"/></svg>
  </span>${note(text, `mn-home-${post.slug}`)}`;
}

// Three stars in the margins that draw themselves as they scroll into view.
// Decoration only, so hidden from screen readers.
const star = (n) => html`<svg class="doodle star star-${n}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <path pathLength="1" d="${messyStar(n * 7919)}"/>
</svg>`;

export function home(site, { home, featured, posts }) {
  const full = featured.filter((p) => !p.half);
  const half = featured.filter((p) => p.half);

  return html`
<article class="home">
  <header class="intro">${star(1)}
    ${site.portrait ? portrait(site.portrait) : ''}
    <h1>${site.title}</h1>
    <p class="lede">${md(home.intro)}</p>
    <p class="contact">
      <a href="mailto:${site.email}">${site.email}</a>
      ${site.resume ? html` · <a href="${site.resume}">résumé</a>` : ''}
    </p>
  </header>

  <section class="now" aria-labelledby="now-heading">
    <h2 class="subhead" id="now-heading">Now</h2>
    <ul class="entries">${home.now.map(entry)}</ul>
    <h2 class="subhead">Previously</h2>
    <ul class="entries">${home.previously.map(entry)}</ul>
  </section>

  <section class="work" aria-labelledby="work-heading">${star(2)}
    <h2 id="work-heading">Selected work</h2>
    <ul class="work-list">${full.map((p) => projectRow(p))}</ul>
    ${half.length ? html`<ul class="work-list work-list--pair">${half.map((p) => projectRow(p))}</ul>` : ''}
    <p class="more"><a href="/projects/">Everything else, including small experiments →</a></p>
  </section>

  <section class="writing" aria-labelledby="writing-heading">${star(3)}
    <h2 id="writing-heading">Writing</h2>
    <ul class="post-list">
      ${posts.map((post) => html`<li><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time> <a href="${post.url}">${post.title}</a></li>`)}
    </ul>
  </section>
</article>`;
}
