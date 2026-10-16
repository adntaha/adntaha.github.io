import { html, raw } from '../lib/html.js';
import { renderInline } from '../lib/markdown.js';
import { workItem, projectRow } from './work.js';

// Its pieces of the stylesheet, in src/css/ (build.js joins them).
export const styles = ['lists.css'];

const md = (text) => raw(renderInline(text));
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// /projects/: everything with a page, then the archive (content/archive.yml).
// All of it is rows in the column, the same as on the homepage; pictures
// hang in the margin. Groups with `rows: true` get full rows, the rest a plain list.
export function projectsIndex(site, projects, archive) {
  return html`
<article class="listing">
  <h1>Projects</h1>
  <ul class="work-list">${projects.map((p) => projectRow(p, { withImage: true }))}</ul>
  ${archive.map((group) =>
    group.rows
      ? html`
  <h2 class="group-heading">${group.heading}</h2>
  <ul class="work-list">
    ${group.items.map((item) =>
      workItem({ url: item.url, title: item.name, meta: item.year, summary: item.blurb, image: item.image, note: item.note, id: `mn-${slugify(item.name)}` }),
    )}
  </ul>`
      : html`
  <h2 class="group-heading">${group.heading}</h2>
  ${group.intro ? html`<p class="quiet">${md(group.intro)}</p>` : ''}
  <ul class="archive">
    ${group.items.map(
      (item) => html`<li><span><a href="${item.url}">${item.name}</a> <span class="quiet">${md(item.blurb)}</span></span></li>`,
    )}
  </ul>`,
  )}
</article>`;
}
