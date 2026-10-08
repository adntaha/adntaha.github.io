import { html, raw } from '../lib/html.js';
import { renderInline } from '../lib/markdown.js';
import { mediaSize } from '../lib/media.js';

const md = (text) => raw(renderInline(text));

// The project's picture or video. Its size is read from the file so the
// page doesn't shift when it loads.
function asset(media) {
  if (!media) return '';
  const size = mediaSize(`public${media.src}`);
  const dims = size ? html` width="${size.width}" height="${size.height}"` : '';
  // `loop: true` is for short silent demos that used to be GIFs: they play by
  // themselves, but keep controls so anyone can pause the motion.
  const playback = media.loop ? html` autoplay muted loop` : '';
  const element =
    media.type === 'video'
      ? html`<video src="${media.src}"${dims}${playback} controls playsinline preload="metadata" aria-label="${media.alt}"></video>`
      : html`<img src="${media.src}" alt="${media.alt}"${dims} decoding="async">`;
  return html`<figure class="project-asset">${element}${media.caption ? html`<figcaption>${md(media.caption)}</figcaption>` : ''}</figure>`;
}

const facts = (project) =>
  [
    ['Team', project.team],
    ['Result', project.outcome],
    ['Built with', project.stack],
  ].filter(([, value]) => value);

// The same <article> is the full project page and, fetched by src/aside.js,
// the content of the homepage aside: picture on top, story in the middle,
// links at the end.
export function project(site, project) {
  return html`
<article class="project" data-aside-content>
  ${asset(project.asset)}
  <header class="project-header">
    <p class="label">${project.period}</p>
    <h1>${project.title}</h1>
    <p class="summary">${md(project.summary)}</p>
    ${facts(project).length
      ? html`<dl class="facts">${facts(project).map(([term, value]) => html`<div><dt>${term}</dt><dd>${md(value)}</dd></div>`)}</dl>`
      : ''}
  </header>
  <div class="prose">${raw(project.html)}</div>
  ${project.links?.length
    ? html`<ul class="project-links">${project.links.map((link) => html`<li><a href="${link.url}">${link.label} ↗</a></li>`)}</ul>`
    : ''}
</article>`;
}
