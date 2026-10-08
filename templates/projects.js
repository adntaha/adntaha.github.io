import { html, raw } from '../lib/html.js';
import { renderInline } from '../lib/markdown.js';

const md = (text) => raw(renderInline(text));

// /projects/: the projects with their own pages first, then the quieter
// archive of hackathon builds and small experiments (content/archive.yml).
export function projectsIndex(site, projects, archive) {
  return html`
<article class="listing">
  <h1>Projects</h1>
  <ul class="work-list">
    ${projects.map(
      (p) => html`<li class="work-item"><a href="${p.url}">
      <span class="work-title">${p.title}</span>
      <span class="work-meta">${p.period}${p.outcome ? html` · ${p.outcome}` : ''}</span>
      <span class="work-summary">${md(p.summary)}</span>
    </a></li>`,
    )}
  </ul>
  ${archive.map(
    (group) => html`
  <h2 class="label">${group.heading}</h2>
  ${group.intro ? html`<p class="quiet">${md(group.intro)}</p>` : ''}
  <ul class="archive${group.items.some((item) => item.year) ? '' : ' archive--undated'}">
    ${group.items.map(
      (item) => html`<li>
      ${item.year ? html`<span class="archive-year">${item.year}</span>` : ''}
      <span><a href="${item.url}">${item.name}</a> <span class="quiet">${md(item.blurb)}</span></span>
    </li>`,
    )}
  </ul>`,
  )}
</article>`;
}
