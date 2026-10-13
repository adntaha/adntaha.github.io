import { html, raw } from '../lib/html.js';
import { renderInline, marginNote, readNote } from '../lib/markdown.js';
import { formatDate, isoDate } from '../lib/dates.js';
import { mediaSize } from '../lib/media.js';
import { projectRow } from './work.js';
import { messyStar, messyArrow } from './doodles.js';

// Its pieces of the stylesheet, in src/css/ (build.js joins them).
export const styles = ['home.css'];

const LATEST_POSTS = 5; // how many posts "Writing" shows; the rest are on /blog/

const md = (text) => raw(renderInline(text));

// One line of "Now" or "Previously": where, then what.
const entry = (item) => html`<li><strong>${md(item.where)}</strong> <span>${md(item.what)}</span>${note(item.note)}</li>`;

// The intro, with a speaker button that plays a clip (src/say.js) for the
// words before `{sound}`. It hangs in the margin just left of them, and shows
// up when you hover over them. Without a clip, the marker just disappears.
// Lucide's volume-2 icon (ISC licence).
const SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>';
const intro = (text, sound) => {
  const html = renderInline(text);
  if (!sound) return raw(html.replace('{sound}', ''));
  const button = `<button type="button" class="say" data-sound="${sound}" title="Play" aria-label="Play “Hello there”">${SPEAKER}</button>`;
  return raw(html.replace(/^(.*?)\{sound\}/, `<span class="greeting">${button}$1</span>`));
};

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
    <p class="lede">${intro(home.intro, home.sound)}</p>
    <p class="contact">
      ${site.links.map((link, i) => html`${i ? html`<span> · </span>` : ''}<a href="${link.url}">${link.label}</a>`)}
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
      ${posts.slice(0, LATEST_POSTS).map((post) => html`<li><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time> <span><a href="${post.url}">${post.title}</a>${postNote(post, home.notes?.posts?.[post.slug])}</span></li>`)}
    </ul>
    <p class="more"><a href="/blog/">More writing →</a></p>
  </section>
</article>`;
}
