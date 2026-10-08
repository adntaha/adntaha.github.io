import { html, raw } from '../lib/html.js';
import { renderInline, marginNote } from '../lib/markdown.js';
import { formatDate, isoDate } from '../lib/dates.js';
import { mediaSize } from '../lib/media.js';

const md = (text) => raw(renderInline(text));

// One line of "Now" or "Previously": where, then what.
const entry = (item) => html`<li><strong>${md(item.where)}</strong> <span>${md(item.what)}</span>${note(item.note)}</li>`;

function portrait({ src, alt }) {
  const size = mediaSize(`public${src}`);
  return html`<img class="portrait" src="${src}" alt="${alt}"${size ? html` width="${size.width}" height="${size.height}"` : ''}>`;
}
const note = (text, id) => (text ? raw(marginNote(renderInline(text), id)) : '');

// One project in "Selected work". Clicking opens the aside (see src/aside.js);
// without JS, or with a modifier key, it's an ordinary link to the project page.
// The margin note comes first so it floats level with the title; on phones,
// CSS moves its ✎ below the summary.
const workItem = (project) => html`
<li class="work-item">${note(project.note, `mn-home-${project.slug}`)}
  <a href="${project.url}" data-aside>
    <span class="work-title">${project.title}</span>
    <span class="work-meta">${project.period}${project.outcome ? html` · ${project.outcome}` : ''}</span>
    <span class="work-summary">${md(project.summary)}</span>
  </a>
</li>`;

export function home(site, { home, featured, posts }) {
  const full = featured.filter((p) => !p.half);
  const half = featured.filter((p) => p.half);

  return html`
<article class="home">
  <header class="intro">
    ${site.portrait ? portrait(site.portrait) : ''}
    <h1>${site.title}</h1>
    <p class="lede">${md(home.intro)}</p>
    <p class="contact">
      <a href="mailto:${site.email}">${site.email}</a>
      ${site.resume ? html` · <a href="${site.resume}">Résumé</a>` : ''}
    </p>
  </header>

  <section class="now" aria-labelledby="now-heading">
    <h2 class="label" id="now-heading">Now</h2>
    <ul class="entries">${home.now.map(entry)}</ul>
    <h2 class="label">Previously</h2>
    <ul class="entries entries--past">${home.previously.map(entry)}</ul>
  </section>

  <section class="work" aria-labelledby="work-heading">
    <h2 id="work-heading">Selected work</h2>
    <ul class="work-list">${full.map(workItem)}</ul>
    ${half.length ? html`<ul class="work-list work-list--pair">${half.map(workItem)}</ul>` : ''}
    <p class="more"><a href="/projects/">Everything else, including small experiments →</a></p>
  </section>

  <section class="writing" aria-labelledby="writing-heading">
    <h2 id="writing-heading">Writing${note(home.notes?.writing, 'mn-home-writing')}</h2>
    <ul class="post-list">
      ${posts.map((post) => html`<li><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time> <a href="${post.url}">${post.title}</a></li>`)}
    </ul>
  </section>
</article>

<dialog class="aside" id="aside" aria-label="Project details">
  <div class="aside-bar">
    <a class="aside-full" href="#">Open as page ↗</a>
    <button type="button" class="aside-close" aria-label="Close">✕</button>
  </div>
  <div class="aside-body"></div>
</dialog>`;
}
