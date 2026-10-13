// The handwritten margin notes, as the board sees them: where they are (so the
// eraser can rub them out) and every letter in them (so a chalk eraser can
// smudge the actual words). All in page coordinates.

// The notes, minus any pictures in them, as one path.
export function noteArea() {
  const area = new Path2D();
  const add = (el) => {
    const box = el.getBoundingClientRect();
    if (box.width) area.rect(box.left + scrollX - 2, box.top + scrollY - 2, box.width + 4, box.height + 4);
  };
  for (const note of document.querySelectorAll('.mn')) {
    add(note);
    note.querySelectorAll('img').forEach(add); // inside the note's box, so 'evenodd' cuts it out
  }
  return area;
}

// Every letter inside a rectangle. Measuring them is slow, so it's done once
// and reused until forgetLetters() says the layout has changed.
let letters = null;

export function forgetLetters() {
  letters = null;
}

export function noteLetters([left, top, right, bottom]) {
  letters ??= measureLetters();
  return letters.filter((l) => l.left < right && l.right > left && l.top < bottom && l.bottom > top);
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
        found.push({
          char: text.data[i],
          left: r.left + scrollX,
          top: r.top + scrollY,
          right: r.right + scrollX,
          bottom: r.bottom + scrollY,
          font,
          color: style.color,
        });
      }
    }
  }
  return found;
}
