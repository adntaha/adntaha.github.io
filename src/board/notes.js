// The handwritten margin notes, as the board sees them: where they are (so the
// eraser can rub them out) and their letters (so a chalk eraser has the
// actual words to smudge). All in page coordinates.

// The notes, minus any pictures in them: as one path for clipping to, and as
// rectangles for a quick "is this anywhere near a note?".
export function noteGeometry() {
  const path = new Path2D();
  const rects = [];
  const add = (el) => {
    const box = el.getBoundingClientRect();
    if (!box.width) return null;
    const rect = [box.left + scrollX - 2, box.top + scrollY - 2, box.right + scrollX + 2, box.bottom + scrollY + 2];
    path.rect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
    return rect;
  };
  for (const note of document.querySelectorAll('.mn')) {
    const rect = add(note);
    if (!rect) continue;
    rects.push(rect);
    note.querySelectorAll('img').forEach(add); // inside the note's box, so 'evenodd' cuts it out
  }
  return { path, rects };
}

// Draw every note's letters onto ctx (in its current transform), each where
// the page put it. They're smudged, blurred, so roughly right is enough: the
// letters aren't rotated with the note. Measuring them is slow, so it's done
// once and reused until forgetNotes() says the layout has changed.
let letters = null;

export function forgetNotes() {
  letters = null;
}

export function drawNoteLetters(ctx) {
  letters ??= measureLetters();
  ctx.textBaseline = 'top';
  for (const { char, x, y, font, color } of letters) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(char, x, y);
  }
}

function measureLetters() {
  const found = [];
  const range = document.createRange();
  for (const note of document.querySelectorAll('.mn')) {
    if (!note.getBoundingClientRect().width) continue;
    const style = getComputedStyle(note);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const walker = document.createTreeWalker(note, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text.data[i])) continue;
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        const r = range.getBoundingClientRect();
        found.push({ char: text.data[i], x: r.left + scrollX, y: r.top + scrollY, font, color: style.color });
      }
    }
  }
  return found;
}
