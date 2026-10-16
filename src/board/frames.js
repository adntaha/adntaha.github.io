// Coordinates. There are two kinds, and this module is the only place that
// converts between them:
//
//   page coordinates, from the top-left corner of the page: what the DOM, the
//   pointer and the canvas use. Everything is in page coordinates, except...
//
//   frame coordinates, which is how strokes keep their points. A frame is
//   pinned to the text: its x is measured from the middle of the text column,
//   its y from the top of an anchor element (a heading, paragraph, list item
//   and so on). Zooming changes the window's size in CSS pixels, which slides
//   the centred column sideways and, through spacing set in vh, moves things
//   up and down; but it never changes the layout inside the column. So a
//   stroke kept in frame coordinates stays on the words it was drawn over.
//
// Rectangles are [left, top, right, bottom] in either kind.

const column = document.querySelector('main') ?? document.body;
const ANCHORS = 'h1, h2, h3, p, li, figure, dl, pre, blockquote, hr, .mn, .doodle';

// Where things are is read from the layout once, then reused until
// remeasure() says the layout may have moved (each repaint, each new stroke).
let middle = null;
const tops = new Map(); // anchor → its top, in page coordinates

export function remeasure() {
  middle = null;
  tops.clear();
}

function columnMiddle() {
  if (middle === null) {
    const box = column.getBoundingClientRect();
    middle = box.left + scrollX + box.width / 2;
  }
  return middle;
}

function topOf(anchor) {
  if (!anchor) return 0; // no anchor: measured from the top of the page
  if (!tops.has(anchor)) tops.set(anchor, anchor.getBoundingClientRect().top + scrollY);
  return tops.get(anchor);
}

// Hidden elements (like the margin notes on phones) report the position of
// wherever the page is scrolled to, so they can't anchor anything.
const visible = (el) => {
  const box = el.getBoundingClientRect();
  return box.width > 0 || box.height > 0;
};

export class Frame {
  constructor(anchor = null) {
    this.anchor = anchor;
  }

  // The frame's origin, in page coordinates, as the page is laid out now.
  origin() {
    return [columnMiddle(), topOf(this.anchor)];
  }

  toPage(x, y) {
    const [ox, oy] = this.origin();
    return [x + ox, y + oy];
  }

  fromPage(x, y) {
    const [ox, oy] = this.origin();
    return [x - ox, y - oy];
  }

  rectToPage([l, t, r, b]) {
    return [...this.toPage(l, t), ...this.toPage(r, b)];
  }

  rectFromPage([l, t, r, b]) {
    return [...this.fromPage(l, t), ...this.fromPage(r, b)];
  }
}

// The frame for something started at a point on the page: anchored to the
// closest visible anchor element whose top is above it.
export function frameAt(pageY) {
  let best = null;
  for (const el of column.querySelectorAll(ANCHORS)) {
    const top = topOf(el);
    if (top <= pageY && (!best || top > topOf(best)) && visible(el)) best = el;
  }
  return new Frame(best);
}
