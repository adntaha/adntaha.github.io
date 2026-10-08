// Markdown → HTML, with the few extras this site's writing needs:
//   [^1] footnotes              (marked-footnote)
//   $x$ and $$…$$ math          (rendered to HTML at build time by KaTeX: no math JS in the browser)
//   ^[a note in the margin]     margin notes, see marginNote() below
//   image sizes                 width/height filled in from the file, so nothing shifts while loading

import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import markedKatex from 'marked-katex-extension';
import { mediaSize } from './media.js';
import { escape } from './html.js';

// Margin notes need ids that are unique within a page. render() resets this.
let notePrefix = 'mn';
let noteCount = 0;

// A margin note sits beside the text on wide screens. On narrow screens it
// collapses behind a small ✎ toggle; the checkbox makes that work without JS.
// Templates call this directly too, so the homepage can have notes.
export function marginNote(innerHTML, id = `${notePrefix}-${++noteCount}`) {
  return (
    // ︎ asks for the plain text glyph, not a colour emoji pencil.
    `<label for="${id}" class="mn-toggle" title="Show note">✎︎</label>` +
    `<input type="checkbox" id="${id}" class="mn-toggle-input">` +
    `<small class="mn">${innerHTML}</small>`
  );
}

const marginNotes = {
  name: 'marginNote',
  level: 'inline',
  start: (src) => src.indexOf('^['),
  tokenizer(src) {
    // ^[ … ], allowing one level of brackets inside (for links).
    const match = /^\^\[((?:[^[\]]|\[[^\]]*\])+)\]/.exec(src);
    if (match) {
      return { type: 'marginNote', raw: match[0], tokens: this.lexer.inlineTokens(match[1]) };
    }
  },
  renderer(token) {
    return marginNote(this.parser.parseInline(token.tokens));
  },
};

const sizedImages = {
  renderer: {
    image({ href, title, text }) {
      const size = href.startsWith('/') ? mediaSize(`public${href}`) : null;
      const dims = size ? ` width="${size.width}" height="${size.height}"` : '';
      const titleAttr = title ? ` title="${escape(title)}"` : '';
      return `<img src="${escape(href)}" alt="${escape(text)}"${dims}${titleAttr} loading="lazy" decoding="async">`;
    },
  },
};

const marked = new Marked(
  { gfm: true },
  markedFootnote({ headingClass: 'visually-hidden' }),
  // Lenient about where math ends (old posts write $\Gamma$'s). The cost: money must be
  // written \$50 in Markdown, or "$50 … $300" becomes an equation (see render()).
  markedKatex({ throwOnError: false, nonStandard: true }),
  { extensions: [marginNotes] },
  sizedImages,
);

// The math extension doesn't understand \$, so turn it into an HTML entity it can't
// mistake for math. The browser still shows a plain "$".
const escapeDollars = (markdown) => String(markdown ?? '').replaceAll('\\$', '&#36;');

export function render(markdown, { idPrefix = 'mn' } = {}) {
  notePrefix = idPrefix;
  noteCount = 0;
  return marked.parse(escapeDollars(markdown));
}

// For short strings like a one-line summary: no wrapping <p>.
export const renderInline = (markdown) => marked.parseInline(escapeDollars(markdown));
