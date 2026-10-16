import { html, raw } from '../lib/html.js';
import { renderInline, marginNote, readNote } from '../lib/markdown.js';
import { mediaSize } from '../lib/media.js';

// Its pieces of the stylesheet, in src/css/ (build.js joins them).
export const styles = ['lists.css'];

// A whole row is one link, and links can't nest, so [text](url) in a summary keeps only its text.
const withoutLinks = (markdown) => String(markdown ?? '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

// A picture pasted into the margin, like a print in a notebook. It's
// decorative (alt=""): the row's title beside it already says what it is.
function print(src) {
  const size = mediaSize(`public${src}`);
  return html`<img class="print" src="${src}" alt=""${size ? html` width="${size.width}" height="${size.height}"` : ''} loading="lazy" decoding="async">`;
}

// What hangs in the margins beside a row: a picture on the left, a handwritten
// note on the right (unless it asks for the left), or both. Both share one ✎
// on phones (see .work-item in src/css/lists.css), so a row never gets two.
function margin({ image, note, id }) {
  const { text, side } = readNote(note);
  if (!image) return text ? raw(marginNote(renderInline(text), id, side)) : '';
  const words = text ? `<small class="mn${side === 'left' ? ' mn--left' : ''}">${renderInline(text)}</small>` : '';
  return raw(marginNote(`${print(image)}`, id, 'left') + words);
}

// One row of work: title, a line of facts, one sentence. Used for "Selected
// work" on the homepage and for everything on /projects/. Rows with nowhere
// to link to (say, a competition) are the same row, just not a link.
// On phones, CSS moves the margin's ✎ below the summary.
export function workItem({ url, title, meta, summary, image, note, id }) {
  const row = html`
    <span class="work-title">${title}</span>
    ${meta ? html`<span class="work-meta">${meta}</span>` : ''}
    <span class="work-summary">${raw(renderInline(withoutLinks(summary)))}</span>`;
  return html`
<li class="work-item">${margin({ image, note, id })}
  ${url ? html`<a class="work-row" href="${url}">${row}</a>` : html`<div class="work-row">${row}</div>`}
</li>`;
}

// A project page's row: its period and result, and (where wanted) its picture.
export const projectRow = (project, { withImage = false } = {}) =>
  workItem({
    url: project.url,
    title: project.title,
    meta: [project.period, project.outcome].filter(Boolean).join(' · '),
    summary: project.summary,
    image: withImage ? (project.thumb ?? (project.asset?.type === 'image' ? project.asset.src : null)) : null,
    note: project.note,
    id: `mn-${withImage ? 'list' : 'home'}-${project.slug}`,
  });
