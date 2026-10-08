import { html, raw } from '../lib/html.js';
import { renderInline } from '../lib/markdown.js';
import { mediaSize } from '../lib/media.js';

const md = (text) => raw(renderInline(text));

// A whole card is one link, and links can't nest, so [text](url) in a card keeps only its text.
const withoutLinks = (markdown) => String(markdown ?? '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

// One picture card: image on top with the date and title laid over it, a
// sentence underneath. Without an image, the title gets the whole tile.
// The image is decorative (alt=""): the title right on top of it is the link text.
function card({ url, title, date, text, image }) {
  const size = image && mediaSize(`public${image}`);
  return html`<li class="card">
    <a href="${url}">
      <span class="card-art${image ? '' : ' card-art--text'}">
        ${image
          ? html`<img src="${image}" alt=""${size ? html` width="${size.width}" height="${size.height}"` : ''} loading="lazy" decoding="async">`
          : ''}
        ${date ? html`<span class="card-date">${date}</span>` : ''}
        <span class="card-title">${title}</span>
      </span>
      <span class="card-text">${md(withoutLinks(text))}</span>
    </a>
  </li>`;
}

// A project page's card picture: its `thumb`, or its top image if it has one.
const projectImage = (p) => p.thumb ?? (p.asset?.type === 'image' ? p.asset.src : null);

// /projects/: a grid of everything with a page, then the archive
// (content/archive.yml): grid groups as cards, the rest as a plain list.
export function projectsIndex(site, projects, archive) {
  return html`
<article class="listing">
  <h1>Projects</h1>
  <ul class="cards">
    ${projects.map((p) => card({ url: p.url, title: p.title, date: p.period, text: p.summary, image: projectImage(p) }))}
  </ul>
  ${archive.map((group) =>
    group.grid
      ? html`
  <h2 class="label">${group.heading}</h2>
  <ul class="cards">
    ${group.items.map((item) => card({ url: item.url, title: item.name, date: item.year, text: item.blurb, image: item.image }))}
  </ul>`
      : html`
  <h2 class="label">${group.heading}</h2>
  ${group.intro ? html`<p class="quiet">${md(group.intro)}</p>` : ''}
  <ul class="archive">
    ${group.items.map(
      (item) => html`<li><span><a href="${item.url}">${item.name}</a> <span class="quiet">${md(item.blurb)}</span></span></li>`,
    )}
  </ul>`,
  )}
</article>`;
}
