import { html, raw } from '../lib/html.js';
import { renderInline, marginNote, readNote } from '../lib/markdown.js';
import { mediaSize } from '../lib/media.js';

// A whole row is one link, and links can't nest, so [text](url) in a summary keeps only its text.
const withoutLinks = (markdown) => String(markdown ?? '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

// A picture pasted into the margin, like a print in a notebook. It's
// decorative (alt=""): the row's title beside it already says what it is.
function print(src) {
  const size = mediaSize(`public${src}`);
  return html`<img class="print" src="${src}" alt=""${size ? html` width="${size.width}" height="${size.height}"` : ''} loading="lazy" decoding="async">`;
}

// What hangs in the margin beside a row: a picture, a handwritten note, or both.
function margin({ image, note, id }) {
  const { text, side } = readNote(note);
  if (!image && !text) return '';
  const words = text ? `<span class="mn-text">${renderInline(text)}</span>` : '';
  return raw(marginNote(`${image ? print(image) : ''}${words}`, id, side));
}

// One row of work: title, a line of facts, one sentence. Used for "Selected
// work" on the homepage and for everything on /projects/. Rows with nowhere
// to link to (say, a competition) are the same row, just not a link.
// The margin comes first in the markup so it floats level with the title;
// on phones, CSS moves its ✎ below the summary.
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
