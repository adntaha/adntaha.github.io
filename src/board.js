// The board. A small tray in the bottom-right corner holds markers (on the
// whiteboard, in light mode) or chalk (on the blackboard, in dark mode), an
// eraser, and the ordinary cursor. Pick one up and draw anywhere: the drawing
// goes on the board itself, behind the typed text and pictures. The eraser
// rubs out your drawing, and the handwritten notes and doodles in the margin too.
// Nothing is saved: refresh, and the board is clean again.
//
// How it works: every stroke is a list of points in page coordinates, drawn on
// one canvas the size of the whole page, so it scrolls with the page for free.
// The canvas sits under the typed text but over the margin notes (see "The
// board" in style.css), so the eraser can rub the notes out by painting board
// colour over them. While someone draws, only the patch around the newest bit
// of stroke is repainted, once per frame. Until someone picks up a tool, none
// of this exists.

const PALETTES = {
  light: [
    ['Black marker', '#1b1d20'],
    ['Blue marker', '#1d4fc4'],
    ['Green marker', '#178a45'],
    ['Red marker', '#d12a2a'],
  ],
  dark: [
    ['White chalk', '#f3f2ec'],
    ['Blue chalk', '#8cc4ff'],
    ['Red chalk', '#ff8f84'],
    ['Yellow chalk', '#f2d675'],
  ],
};
// The blackboard's eraser is your hand: pointing while you hover, flat
// while you wipe (see icon() and cursorFor()).
const PALM = '✋';
const FINGER = '👆';
const EMOJI_FONTS = `'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif`;
const LINE = 2.75; // the same thickness as the doodles' stroke (.doodle in style.css)
const ERASER = 28;
// One pass of the eraser wipes a whiteboard clean. Chalk smudges instead: each
// pass smears what's under the eraser into a haze about a third as strong, so
// the first pass leaves a smudge and the second a faint ghost.
const SMUDGE = 0.3;
const SMEAR = 6; // how far chalk dust spreads when smeared, in px
const NOTE_DUST = 0.5; // how much of a note's chalk survives being smeared
// A smear is kept at a quarter of the resolution; drawn back up with smooth
// scaling, that's the blur (much cheaper than a blur filter, in Firefox above all).
const SNAPSHOT_SCALE = 0.25;
const SCRUB = -0.5; // doubling back by more than ~120° starts a new eraser pass
// Big canvases are memory-hungry (and Safari refuses ones over ~16 million
// pixels), so very long pages get a slightly softer drawing instead.
const MAX_PIXELS = 12e6;

const dark = matchMedia('(prefers-color-scheme: dark)');
const strokes = []; // see stroke() below
let tool = { kind: 'cursor' }; // or { kind: 'ink', color } or { kind: 'eraser' }
let current = null; // the stroke being drawn
let board = null; // the canvas, once someone picks up a tool
let ratio = 1; // canvas pixels per CSS pixel

// --- The tray. Each tool is drawn as the top half of a stick of chalk (or a
// marker) poking up diagonally out of the tray, like the pens in Apple Notes.

const tray = document.createElement('div');
tray.className = 'tray';
tray.setAttribute('role', 'toolbar');
tray.setAttribute('aria-label', 'Draw on this page');
document.body.append(tray);

// Shading that makes a flat stick read as a cylinder: dark edges, a highlight
// a third of the way across.
const roundness = (id) => `<linearGradient id="${id}" x1="0" x2="1">
  <stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".35" stop-color="#fff" stop-opacity=".4"/>
  <stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>`;

function icon({ kind, color }) {
  if (kind === 'cursor') {
    return '<svg viewBox="0 0 28 40" aria-hidden="true"><path d="M9 11l13 7.5-5.6 1.4-2.9 5.6z" fill="currentColor"/></svg>';
  }
  if (kind === 'eraser') {
    return dark.matches
      ? // your hand: on a blackboard you wipe chalk with your palm
        `<svg viewBox="0 0 28 40" aria-hidden="true"><text x="14" y="31" font-size="21" text-anchor="middle" font-family="${EMOJI_FONTS.replaceAll("'", '&apos;')}">${PALM}</text></svg>`
      : // a crumpled tissue, the whiteboard's real eraser: an irregular outline, fine creases
        `<svg viewBox="0 0 28 40" aria-hidden="true"><defs><linearGradient id="tissue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e2e5e8"/></linearGradient></defs>
          <path d="M4 38 L5 28 L3 21 L7 17 L6 11 L11 10 L14 6 L18 9 L23 8 L22 14 L26 18 L23 23 L25 30 L22 38 Z" fill="url(#tissue)" stroke="#a7adb4" stroke-width="0.7" stroke-linejoin="round"/>
          <path d="M7 17 L11 18 L14 14 M11 10 L12 14 M18 9 L17 13 L22 14 M14 14 L17 13 M11 18 L13 23 L9 27 M13 23 L19 21 L23 23 M19 21 L18 27 L22 30 M9 27 L14 31" fill="none" stroke="#c4c9ce" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  const id = `round-${color.slice(1)}`;
  return dark.matches
    ? // chalk: a plain cylinder, its flat end facing up and slightly towards us
      `<svg viewBox="0 0 28 40" aria-hidden="true"><defs>${roundness(id)}</defs><g transform="rotate(25 14 36)">
        <rect x="8" y="8" width="12" height="46" fill="${color}"/><rect x="8" y="8" width="12" height="46" fill="url(#${id})"/>
        <ellipse cx="14" cy="8" rx="6" ry="2.2" fill="${color}"/><ellipse cx="14" cy="8" rx="6" ry="2.2" fill="#fff" opacity=".3"/></g></svg>`
    : // marker: a round barrel with a band, and a darker conical tip
      `<svg viewBox="0 0 28 40" aria-hidden="true"><defs>${roundness(id)}</defs><g transform="rotate(25 14 36)">
        <path d="M12 4h4l2.5 9h-9z" fill="${color}"/><path d="M12 4h4l2.5 9h-9z" fill="#000" opacity=".3"/>
        <rect x="8" y="13" width="12" height="42" rx="1.5" fill="${color}"/><rect x="8" y="13" width="12" height="42" rx="1.5" fill="url(#${id})"/>
        <rect x="8" y="17" width="12" height="3" fill="#fff" opacity=".5"/></g></svg>`;
}

function button(label, content, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.title = label;
  b.setAttribute('aria-label', label);
  b.innerHTML = content;
  b.addEventListener('click', onClick);
  return b;
}

function buildTray() {
  const palette = PALETTES[dark.matches ? 'dark' : 'light'];
  // A colour from the other board's palette doesn't exist here; put it down.
  if (tool.kind === 'ink' && !palette.some(([, c]) => c === tool.color)) return use({ kind: 'cursor' });

  const choices = [
    ['Cursor', { kind: 'cursor' }],
    [dark.matches ? 'Hand' : 'Tissue', { kind: 'eraser' }],
    ...palette.toReversed().map(([label, color]) => [label, { kind: 'ink', color }]),
  ].map(([label, t]) => {
    const b = button(label, icon(t), () => use(t));
    b.setAttribute('aria-pressed', String(t.kind === tool.kind && t.color === tool.color));
    return b;
  });
  // The first button shows the tool in hand. The tray lays out right to left,
  // so it sits in the corner, and the choices open out to its left.
  const handle = button('Drawing tools', icon(tool), () => tray.classList.toggle('is-open'));
  handle.classList.add('tray-current');
  tray.replaceChildren(handle, ...choices);
}

function use(next) {
  tool = next;
  tray.classList.remove('is-open');
  const drawing = tool.kind !== 'cursor';
  if (drawing) setUpBoard();
  document.documentElement.classList.toggle('is-drawing', drawing);
  document.documentElement.style.setProperty('--pen', cursorFor(tool));
  buildTray();
}

// The pointer becomes a dot of the marker's colour, your hand on the
// blackboard (a pointing finger, then a flat palm while `pressed`), or the
// tissue's outline on the whiteboard.
function cursorFor({ kind, color }, pressed = false) {
  if (kind === 'cursor') return 'auto';
  if (kind === 'eraser' && dark.matches) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text x='16' y='26' font-size='24' text-anchor='middle' font-family="${EMOJI_FONTS}">${pressed ? PALM : FINGER}</text></svg>`;
    const hotspot = pressed ? '16 16' : '16 3'; // the palm's middle, or the fingertip
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspot}, crosshair`;
  }
  const r = kind === 'eraser' ? ERASER / 2 : 3;
  const fill = kind === 'eraser' ? 'none' : encodeURIComponent(color);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${r * 2 + 4}' height='${r * 2 + 4}'><circle cx='${r + 2}' cy='${r + 2}' r='${r}' fill='${fill}' stroke='%23888' stroke-width='1'/></svg>`;
  return `url("data:image/svg+xml,${svg}") ${r + 2} ${r + 2}, crosshair`;
}

// --- Strokes

// erase: is this an eraser pass? chalk: was it made on the blackboard (chalk
// drawing, smudgy erasing) or the whiteboard? box: the points' bounding box.
function stroke({ erase = false, chalk = dark.matches, color, width, points }) {
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i < points.length; i += 2) grow(box, points[i], points[i + 1]);
  return { erase, chalk, color, width, points, box, heading: null };
}

function grow(box, x, y) {
  box[0] = Math.min(box[0], x);
  box[1] = Math.min(box[1], y);
  box[2] = Math.max(box[2], x);
  box[3] = Math.max(box[3], y);
}

// A rectangle around [left, top, right, bottom], padded by half a stroke's width.
const around = ([l, t, r, b], width) => {
  const pad = width / 2 + 2;
  return [l - pad, t - pad, r + pad, b + pad];
};

const smudges = (s) => s.erase && s.chalk;

// The doodles in the margins (stars and arrows; see templates/doodles.js)
// start out as SVG drawings. Once someone picks up a tool, each one that's
// fully drawn becomes ordinary strokes on the board, so it can be drawn over,
// erased and smudged like anything else. Stars still drawing themselves in
// are left alone for now.
function takeDoodles() {
  for (const svg of document.querySelectorAll('.doodle:not(.on-board)')) {
    const paths = [...svg.querySelectorAll('path')];
    const drawing = paths.some((path) => parseFloat(getComputedStyle(path).strokeDashoffset) > 0.001);
    if (!svg.getBoundingClientRect().width || drawing) continue;
    for (const path of paths) {
      const style = getComputedStyle(path);
      const toPage = path.getScreenCTM();
      const length = path.getTotalLength();
      const steps = Math.ceil(length / 2); // a point every couple of units is plenty
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const p = path.getPointAtLength((length * i) / steps).matrixTransform(toPage);
        points.push(p.x + scrollX, p.y + scrollY);
      }
      const line = stroke({ color: style.stroke, width: parseFloat(style.strokeWidth), points });
      strokes.unshift(line); // it was there before anything you drew
      repaint(around(line.box, line.width));
    }
    svg.classList.add('on-board');
  }
}

// --- Drawing. While a tool is in hand the page ignores the pointer (no link
// hovers, no clicks; see html.is-drawing in style.css), and these get it instead.

function setUpBoard() {
  if (board) return;
  board = document.createElement('canvas');
  board.className = 'board';
  board.setAttribute('aria-hidden', 'true');
  document.body.append(board);
  resize();
  new ResizeObserver(resize).observe(document.body);

  addEventListener('pointerdown', start);
  addEventListener('pointermove', move);
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
}

function start(event) {
  if (tool.kind === 'cursor' || event.composedPath().includes(tray) || event.button > 0) return;
  event.preventDefault(); // no text selection, no focus
  try {
    document.documentElement.setPointerCapture(event.pointerId); // keep drawing even off the window's edge
  } catch {}
  document.documentElement.style.setProperty('--pen', cursorFor(tool, true));
  takeDoodles();
  begin(event.pageX, event.pageY);
  queueRepaint(around(current.box, current.width));
}

function begin(x, y) {
  const erase = tool.kind === 'eraser';
  current = stroke({ erase, color: tool.color, width: erase ? ERASER : LINE, points: [x, y] });
  // A chalk eraser smears whatever was under it before this pass. That never
  // changes, so it's picked up once, now, rather than on every move.
  if (smudges(current)) current.smear = pickUp();
  strokes.push(current);
}

function move(event) {
  if (!current) return;
  for (const e of event.getCoalescedEvents?.() ?? [event]) {
    const [px, py] = current.points.slice(-2);
    const [x, y] = [e.pageX, e.pageY];
    const length = Math.hypot(x - px, y - py);
    if (length < 0.5) continue;
    const heading = [(x - px) / length, (y - py) / length];
    // The eraser doubled back: that's a new pass over the same spot.
    if (current.erase && current.heading && heading[0] * current.heading[0] + heading[1] * current.heading[1] < SCRUB) {
      begin(px, py);
    }
    current.heading = heading;
    current.points.push(x, y);
    grow(current.box, x, y);
    queueRepaint(around([Math.min(px, x), Math.min(py, y), Math.max(px, x), Math.max(py, y)], current.width));
  }
}

// Pointer events can come several times a frame; gather what needs repainting
// and do it once, just before the next frame.
let dirty = null;
function queueRepaint(area) {
  if (dirty) {
    dirty = [Math.min(dirty[0], area[0]), Math.min(dirty[1], area[1]), Math.max(dirty[2], area[2]), Math.max(dirty[3], area[3])];
    return;
  }
  dirty = area;
  requestAnimationFrame(() => {
    const area = dirty;
    dirty = null;
    repaint(area);
  });
}

function end() {
  current = null;
  document.documentElement.style.setProperty('--pen', cursorFor(tool));
}

// The canvas covers the whole page; when the page changes size, so does it.
function resize() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  ratio = Math.min(devicePixelRatio, 2, Math.sqrt(MAX_PIXELS / (width * height)));
  board.width = Math.round(width * ratio);
  board.height = Math.round(height * ratio);
  board.style.width = `${width}px`;
  board.style.height = `${height}px`;
  letters = null; // the notes may have moved
  repaint([0, 0, width, height]);
}

// Redraw one rectangle of the page (in page coordinates): clear it, then
// replay every stroke that passes through it, in order.
function repaint(area) {
  // Snap outwards to whole canvas pixels: a patch with fractional edges would
  // half-clear the pixels along them and leave hairline seams.
  const snap = (v, round) => round(v * ratio) / ratio;
  area = [snap(area[0], Math.floor), snap(area[1], Math.floor), snap(area[2], Math.ceil), snap(area[3], Math.ceil)];
  const [left, top, right, bottom] = area;
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  const notes = noteArea();
  // Everywhere except the notes' handwriting (pictures count as "everywhere").
  const elsewhere = new Path2D();
  elsewhere.rect(left, top, right - left, bottom - top);
  elsewhere.addPath(notes);

  const ctx = board.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.clearRect(left, top, right - left, bottom - top);
  ctx.lineCap = ctx.lineJoin = 'round';

  for (const s of strokes) {
    const [l, t, r, b] = around(s.box, s.width + 2 * SMEAR);
    if (r < left || l > right || b < top || t > bottom) continue;
    const path = toPath(s.points);
    ctx.lineWidth = s.width;
    if (!s.erase) {
      ctx.strokeStyle = s.chalk ? chalk(ctx, s.color) : s.color;
      ctx.stroke(path);
      continue;
    }
    // On the bare board, rubbing out removes the drawing...
    ctx.save();
    ctx.clip(elsewhere, 'evenodd');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000';
    ctx.stroke(path);
    ctx.restore();
    // ...and on the notes, it paints board colour over the handwriting.
    ctx.save();
    ctx.clip(notes, 'evenodd');
    ctx.strokeStyle = paper;
    ctx.stroke(path);
    ctx.restore();
    // Chalk: then what the eraser picked up goes back down along its path,
    // fainter: smeared drawing on the board, smeared handwriting on the notes.
    if (s.smear) {
      const drawing = footprint(s.smear.drawing, path, s.width, area, 0);
      const handwriting = footprint(s.smear.handwriting, path, s.width, area, 1);
      ctx.save();
      ctx.clip(elsewhere, 'evenodd');
      ctx.globalAlpha = SMUDGE;
      ctx.drawImage(drawing, left, top, right - left, bottom - top);
      ctx.restore();
      if (handwriting) {
        ctx.save();
        ctx.clip(notes, 'evenodd');
        ctx.drawImage(handwriting, left, top, right - left, bottom - top);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

function toPath(points) {
  const path = new Path2D();
  path.moveTo(points[0], points[1]);
  // A single click still leaves a dot.
  if (points.length === 2) path.lineTo(points[0] + 0.1, points[1]);
  for (let i = 2; i < points.length; i += 2) path.lineTo(points[i], points[i + 1]);
  return path;
}

// What a chalk eraser picks up when a pass starts, smeared, as { source,
// area } pairs (a canvas, and the part of the page it covers):
//   drawing: the chalk on the visible part of the board, at low resolution;
//   handwriting: whatever handwriting still shows in the notes there, blurred.
//     Letters need full resolution to smudge believably, but the notes are
//     small, so this only covers them (and is null if none are in view).
function pickUp() {
  const pad = ERASER + SMEAR;
  const x = Math.max(0, scrollX - pad);
  const y = Math.max(0, scrollY - pad);
  const w = Math.min(board.width / ratio, scrollX + innerWidth + pad) - x;
  const h = Math.min(board.height / ratio, scrollY + innerHeight + pad) - y;

  const drawing = canvasOfSize(Math.ceil(w * SNAPSHOT_SCALE), Math.ceil(h * SNAPSHOT_SCALE));
  // Shrinking with the best filtering averages the chalk's grain into a haze
  // (without it, the grain is sampled into dashes).
  drawing.imageSmoothingQuality = 'high';
  drawing.drawImage(board, x * ratio, y * ratio, w * ratio, h * ratio, 0, 0, drawing.canvas.width, drawing.canvas.height);

  return { drawing: { source: drawing.canvas, area: [x, y, w, h] }, handwriting: smearLetters(noteLetters([x, y, x + w, y + h])) };
}

function smearLetters(letters) {
  if (!letters.length) return null;
  const x = Math.min(...letters.map((l) => l.left)) - SMEAR * 2;
  const y = Math.min(...letters.map((l) => l.top)) - SMEAR * 2;
  const w = Math.max(...letters.map((l) => l.right)) + SMEAR * 2 - x;
  const h = Math.max(...letters.map((l) => l.bottom)) + SMEAR * 2 - y;
  const [dw, dh] = [Math.ceil(w * ratio), Math.ceil(h * ratio)];

  // The letters as dust...
  const dust = canvasOfSize(dw, dh);
  dust.setTransform(ratio, 0, 0, ratio, -x * ratio, -y * ratio);
  dust.globalAlpha = NOTE_DUST;
  dust.textBaseline = 'top';
  for (const letter of letters) {
    dust.font = letter.font;
    dust.fillStyle = letter.color;
    dust.fillText(letter.char, letter.left, letter.top);
  }
  // ...except where the board's already been wiped (or drawn over): there's
  // none left to smear there...
  dust.setTransform(1, 0, 0, 1, 0, 0);
  dust.globalAlpha = 1;
  dust.globalCompositeOperation = 'destination-out';
  dust.drawImage(board, x * ratio, y * ratio, dw, dh, 0, 0, dw, dh);
  // ...then smeared.
  const smeared = canvasOfSize(dw, dh);
  smeared.filter = `blur(${(SMEAR / 2) * ratio}px)`;
  smeared.drawImage(dust.canvas, 0, 0);
  return { source: smeared.canvas, area: [x, y, w, h] };
}

function canvasOfSize(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d');
}

// The part of a picked-up smear that falls along an eraser path, within one
// repainted rectangle: a canvas covering that rectangle (null if nothing to smear).
const scratch = [document.createElement('canvas'), document.createElement('canvas')];
function footprint(picked, path, width, [left, top, right, bottom], i) {
  if (!picked) return null;
  const canvas = scratch[i];
  canvas.width = Math.ceil((right - left) * ratio); // also clears it
  canvas.height = Math.ceil((bottom - top) * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(picked.source, ...picked.area);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.lineWidth = width;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.stroke(path);
  return canvas;
}

// The margin notes, minus any pictures in them, in page coordinates.
function noteArea() {
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

// Every letter of the margin notes inside `area`, where it sits on the page.
// Measuring them is slow, so it's done once and reused until the layout
// changes (resize() forgets them).
let letters = null;
function noteLetters([left, top, right, bottom]) {
  letters ??= measureLetters();
  return letters.filter((l) => l.left < right && l.left > left - 50 && l.top < bottom && l.top > top - 50);
}

function measureLetters() {
  const letters = [];
  const range = document.createRange();
  for (const note of document.querySelectorAll('.mn')) {
    const box = note.getBoundingClientRect();
    if (!box.width) continue;
    const style = getComputedStyle(note);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const walker = document.createTreeWalker(note.querySelector('.mn-text') ?? note, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text.data[i])) continue;
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        const r = range.getBoundingClientRect();
        letters.push({ char: text.data[i], left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY, font, color: style.color });
      }
    }
  }
  return letters;
}

// --- Chalk: drawn with a tile of grain made by the same #chalk filter that
// style.css gives the handwriting (it's defined in templates/layout.js), so
// chalk you draw looks like chalk that was already there. (Filtering each
// stroke directly would be slow, and patchy when only part of it repaints.)

const GRAIN = 160; // tile size, in CSS pixels
const chalkTiles = new Map();
function chalk(ctx, color) {
  const key = `${color} ${ratio}`;
  if (!chalkTiles.has(key)) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = Math.round(GRAIN * ratio);
    const t = tile.getContext('2d');
    t.filter = chalkFilter();
    t.fillStyle = color;
    t.fillRect(0, 0, tile.width, tile.height);
    chalkTiles.set(key, tile);
  }
  const pattern = ctx.createPattern(chalkTiles.get(key), 'repeat');
  pattern.setTransform(new DOMMatrix().scaleSelf(1 / ratio)); // the tile is in canvas pixels
  return pattern;
}

// A canvas applies filters in its own pixels, not CSS pixels, so on a
// high-density screen the grain would come out finer: use a copy of #chalk
// with the noise scaled to match.
function chalkFilter() {
  const id = `chalk-${ratio}`.replace('.', '_');
  if (!document.getElementById(id)) {
    const original = document.getElementById('chalk');
    const copy = original.cloneNode(true);
    copy.id = id;
    const noise = copy.querySelector('feTurbulence');
    noise.setAttribute('baseFrequency', noise.getAttribute('baseFrequency') / ratio);
    original.after(copy);
  }
  return `url(#${id})`;
}

// --- Keys and theme

addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && tool.kind !== 'cursor') use({ kind: 'cursor' });
});

dark.addEventListener('change', () => {
  buildTray();
  document.documentElement.style.setProperty('--pen', cursorFor(tool)); // the other board's tool
  if (board) resize();
});

buildTray();
