// The board itself: one canvas the size of the whole page, so it scrolls with
// the page for free, and the strokes on it. The canvas sits over everything
// on the page (see src/css/board.css), so the eraser can rub the margin notes
// out by painting board colour over them.
//
// Drawing is incremental, like on a real board: each move of the pointer
// paints just the new piece of the stroke onto what's already there, so it
// costs the same however much has been drawn. The strokes are kept too, in
// frame coordinates (see frames.js), and replayed in order only when part of
// the board has to be rebuilt: when the layout moves (a resize, zoom, fonts
// loading), the theme changes, or something is taken back off it.

import { remeasure } from './frames.js';
import { noteGeometry, drawNoteLetters, forgetNotes } from './notes.js';

// One pass of the eraser wipes a whiteboard clean. Chalk smudges instead: as
// your hand reaches new ground it picks up what's there and puts some of it
// back down, smeared, so one pass leaves a haze (about 30%) and the second a
// faint ghost. (Some of what each step puts down is picked up again by the
// next, so this is more than the 30% it ends up as.)
const SMUDGE = 0.4;
const SMEAR = 6; // how far past the hand it picks up from, in px
// Big canvases are memory-hungry (and Safari refuses ones over ~16 million
// pixels), so very long pages get a slightly softer drawing instead.
const MAX_PIXELS = 12e6;

export const strokes = []; // oldest first; see stroke()
let board = null; // the canvas, once someone picks up a tool
let ctx = null;
let ratio = 1; // canvas pixels per CSS pixel

// The board again, at a quarter of the size, for the chalk eraser to pick up
// from: every stroke goes on both. (Reading from the board itself would be
// slow: the browser copies the whole board before the next change to it, to
// keep what was read intact. Reading a few pixels from a small canvas kept
// in memory, not on the GPU, costs nothing.) It also has the notes'
// handwriting on it, so that's picked up and smeared like everything else.
// Shrunk this much, and drawn back up with smooth scaling, what's picked up is
// already the smear: no blur filter needed.
const SHADOW = 0.25;
let shadow = null;

// erase: is this an eraser pass? chalk: was it made on the blackboard (chalk
// drawing, smudgy erasing) or the whiteboard? frame: what its points are
// measured from. box: the points' bounding box, in the same coordinates.
export function stroke({ erase = false, chalk, color, width, frame, points }) {
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i < points.length; i += 2) grow(box, points[i], points[i + 1]);
  return { erase, chalk, color, width, frame, points, box, heading: null };
}

export function addPoint(s, x, y) {
  s.points.push(x, y);
  grow(s.box, x, y);
}

function grow(box, x, y) {
  box[0] = Math.min(box[0], x);
  box[1] = Math.min(box[1], y);
  box[2] = Math.max(box[2], x);
  box[3] = Math.max(box[3], y);
}

// A rectangle grown on every side by half a line's width, plus a little.
export const around = ([l, t, r, b], width) => {
  const pad = width / 2 + 2;
  return [l - pad, t - pad, r + pad, b + pad];
};

const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

// --- The canvas

export function createBoard() {
  if (board) return;
  board = document.createElement('canvas');
  board.className = 'board';
  board.setAttribute('aria-hidden', 'true');
  document.body.append(board);
  ctx = board.getContext('2d');
  shadow = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  rebuild();
  new ResizeObserver(relayout).observe(document.body);
  document.fonts?.addEventListener('loadingdone', relayout); // the notes' handwriting may have moved
}

export const hasBoard = () => board !== null;

// What the board's drawing depends on: the page's size, where the text
// column is, and where the notes are. Rebuilding is slow, so it's only done
// when one of these has actually moved.
let layout = '';
const layoutNow = () =>
  JSON.stringify([
    document.documentElement.clientWidth,
    document.documentElement.scrollHeight,
    document.querySelector('main')?.getBoundingClientRect().left,
    noteGeometry().rects,
  ]);

// Something may have moved (the page changed size, or a font loaded).
function relayout() {
  if (layoutNow() !== layout) rebuild();
}

// Draw everything on the board again, from the strokes: after the layout
// moves, or the theme changes. The canvas covers the whole page, so when the
// page changes size, so does it.
export function rebuild() {
  layout = layoutNow();
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  ratio = Math.min(devicePixelRatio, 2, Math.sqrt(MAX_PIXELS / (width * height)));
  // (Setting a canvas's size reallocates it, even to the same size.)
  if (board.width !== Math.round(width * ratio) || board.height !== Math.round(height * ratio)) {
    board.width = Math.round(width * ratio);
    board.height = Math.round(height * ratio);
    board.style.width = `${width}px`;
    board.style.height = `${height}px`;
    shadow.canvas.width = Math.ceil(width * SHADOW);
    shadow.canvas.height = Math.ceil(height * SHADOW);
  }
  forgetNotes();
  measure();
  repaint([0, 0, width, height]);
}

// Where the margin notes are, and the board's colour: read from the page as a
// stroke starts (and after a resize), never while one's being drawn.
let paper = '';
let notes = { path: new Path2D(), rects: [] };
let elsewhere = new Path2D(); // everywhere but the handwriting (pictures count as "everywhere"), for 'evenodd'

export function measure() {
  remeasure();
  paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  notes = noteGeometry();
  // Around a rectangle far bigger than the page: its edges have to be well
  // away from the notes, or where one crossed a note, the softening along it
  // would let a little wiping through onto the handwriting.
  elsewhere = new Path2D();
  elsewhere.rect(-1e5, -1e5, 2e5, 2e5);
  elsewhere.addPath(notes.path);
}

// Rebuild one rectangle of the board (in page coordinates): clear it and
// replay, in order, every stroke that reaches it.
export function repaint(area) {
  // Snap outwards to whole pixels of both canvases: a patch with fractional
  // edges would half-clear the pixels along them and leave hairline seams.
  const unit = 1 / SHADOW;
  const [left, top, right, bottom] = [
    Math.floor(area[0] / unit) * unit,
    Math.floor(area[1] / unit) * unit,
    Math.ceil(area[2] / unit) * unit,
    Math.ceil(area[3] / unit) * unit,
  ];
  for (const [c, scale] of [[ctx, ratio], [shadow, SHADOW]]) {
    c.setTransform(scale, 0, 0, scale, 0, 0);
    c.save();
    c.beginPath();
    c.rect(left, top, right - left, bottom - top);
    c.clip();
    c.clearRect(left, top, right - left, bottom - top);
  }
  drawNoteLetters(shadow);
  for (const s of strokes) {
    if (overlaps(s.frame.rectToPage(around(s.box, s.width + 2 * SMEAR)), [left, top, right, bottom])) paintFrom(s, 0);
  }
  ctx.restore();
  shadow.restore();
}

// Paint stroke s from its nth point to its end: each piece from one point to
// the next (the first point alone is a dot).
export function paintFrom(s, n) {
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  shadow.setTransform(SHADOW, 0, 0, SHADOW, 0, 0);
  const [ox, oy] = s.frame.origin();
  const p = s.points;
  for (let i = n; i < p.length / 2; i++) {
    const x1 = p[2 * i] + ox;
    const y1 = p[2 * i + 1] + oy;
    const x0 = i ? p[2 * i - 2] + ox : x1;
    const y0 = i ? p[2 * i - 1] + oy : y1;
    if (!s.erase) ink(s, x0, y0, x1, y1, i === 0);
    else if (s.chalk) smudge(s, x0, y0, x1, y1, i === 0);
    else wipe(s, x0, y0, x1, y1);
  }
}

// A straight piece of line, with round ends; a dot if it has no length.
function piece(x0, y0, x1, y1, first) {
  const path = new Path2D();
  path.moveTo(x0, y0);
  path.lineTo(first ? x0 + 0.1 : x1, y1);
  return path;
}

// The ground a round brush of radius r covers going from (x0, y0) to (x1, y1):
// a capsule, drawn as one outline. (Built from overlapping circles and a band
// instead, the edges inside it get smoothed too, leaving faint seams.)
function reach(x0, y0, x1, y1, r) {
  const path = new Path2D();
  const a = Math.atan2(y1 - y0, x1 - x0);
  path.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2); // round the far end...
  path.arc(x0, y0, r, a + Math.PI / 2, a + (3 * Math.PI) / 2); // ...and back round the near one
  path.closePath();
  return path;
}

// Clip c to the ground a brush reaches; with `fresh`, only what it hadn't
// already covered at (x0, y0).
function clipToReach(c, x0, y0, x1, y1, r, fresh) {
  c.clip(reach(x0, y0, x1, y1, r));
  if (fresh) {
    // A pixel short of the brush's edge: clipping softens edges, and where two
    // soft edges meet, neither does the whole job. Going a pixel over twice is
    // less noticeable than leaving one half done.
    const covered = new Path2D();
    covered.rect(Math.min(x0, x1) - 2 * r, Math.min(y0, y1) - 2 * r, Math.abs(x1 - x0) + 4 * r, Math.abs(y1 - y0) + 4 * r);
    covered.arc(x0, y0, r - 1, 0, 2 * Math.PI);
    c.clip(covered, 'evenodd');
  }
}

// Chalk's grain, averaged: about how much of the board a line of chalk covers.
// The shadow is too small for grain, so it gets this instead.
const CHALK_COVER = 0.8;

function ink(s, x0, y0, x1, y1, first) {
  const line = piece(x0, y0, x1, y1, first);
  for (const c of [ctx, shadow]) {
    c.save();
    c.lineWidth = s.width;
    c.lineCap = c.lineJoin = 'round';
    c.strokeStyle = s.chalk && c === ctx ? chalk(s.color) : s.color;
    if (s.chalk && c === shadow) c.globalAlpha = CHALK_COVER;
    c.stroke(line);
    c.restore();
  }
}

// Is a rectangle anywhere near a note?
const nearNotes = (rect) => notes.rects.some((n) => overlaps(n, rect));

// Wiping a rectangle under the current clip: on the bare board that removes
// the drawing; on the notes it paints board colour over the handwriting. On
// the shadow, where the handwriting's just more drawing, it all goes.
function wipeArea([l, t, r, b]) {
  shadow.globalCompositeOperation = 'destination-out';
  shadow.fillRect(l, t, r - l, b - t);
  shadow.globalCompositeOperation = 'source-over';
  if (!nearNotes([l, t, r, b])) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(l, t, r - l, b - t);
    ctx.globalCompositeOperation = 'source-over';
    return;
  }
  ctx.save();
  ctx.clip(elsewhere, 'evenodd');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(l, t, r - l, b - t);
  ctx.restore();
  ctx.save();
  ctx.clip(notes.path, 'evenodd');
  ctx.fillStyle = paper;
  ctx.fillRect(l, t, r - l, b - t);
  ctx.restore();
}

// The whiteboard's tissue: one piece of wiping. (Wiping twice is the same as
// once, so it doesn't matter that each piece goes over the end of the last.)
function wipe(s, x0, y0, x1, y1) {
  const r = s.width / 2;
  ctx.save();
  shadow.save();
  clipToReach(ctx, x0, y0, x1, y1, r, false);
  clipToReach(shadow, x0, y0, x1, y1, r, false);
  wipeArea([Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r]);
  ctx.restore();
  shadow.restore();
}

// The blackboard's hand. It goes in small steps (a quarter of its width at
// most), so what it picks up never comes from far away.
function smudge(s, x0, y0, x1, y1, first) {
  const r = s.width / 2;
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (r / 2)));
  let [px, py] = [x0, y0];
  for (let k = 1; k <= steps; k++) {
    const [x, y] = [x0 + ((x1 - x0) * k) / steps, y0 + ((y1 - y0) * k) / steps];
    smudgeStep(px, py, x, y, r, first && k === 1);
    [px, py] = [x, y];
  }
}

// What a step picks up goes on here, to be put back down. A step never picks
// up more than about 15 shadow pixels across, so this is plenty.
const held = document.createElement('canvas').getContext('2d');
held.canvas.width = held.canvas.height = 64;

function smudgeStep(x0, y0, x1, y1, r, first) {
  // Pick up what's there, from the shadow, in whole shadow pixels...
  const pad = r + SMEAR;
  const sx = Math.floor((Math.min(x0, x1) - pad) * SHADOW);
  const sy = Math.floor((Math.min(y0, y1) - pad) * SHADOW);
  const sw = Math.ceil((Math.max(x0, x1) + pad) * SHADOW) - sx;
  const sh = Math.ceil((Math.max(y0, y1) + pad) * SHADOW) - sy;
  held.putImageData(shadow.getImageData(sx, sy, sw, sh), 0, 0);
  const area = [sx / SHADOW, sy / SHADOW, (sx + sw) / SHADOW, (sy + sh) / SHADOW];
  const [l, t, rr, b] = area;
  ctx.save();
  shadow.save();
  // ...wipe the new ground clean (only the new ground: anywhere it's already
  // been this pass, it's left the smudge it should)...
  clipToReach(ctx, x0, y0, x1, y1, r, !first);
  clipToReach(shadow, x0, y0, x1, y1, r, !first);
  wipeArea(area);
  // ...and put some of it back, smeared.
  for (const c of [ctx, shadow]) {
    c.globalAlpha = SMUDGE;
    c.drawImage(held.canvas, 0, 0, sw, sh, l, t, rr - l, b - t);
  }
  ctx.restore();
  shadow.restore();
}

// --- Chalk: drawn with a tile of grain made by the same #chalk filter that
// src/css/layout.css gives the handwriting (it's defined in templates/layout.js), so
// chalk you draw looks like chalk that was already there. (Filtering each
// stroke directly would be slow, and patchy when only part of it repaints.)

const GRAIN = 160; // tile size, in CSS pixels
// One pattern per colour, made once: making a pattern copies its tile.
const chalkPatterns = new Map();
function chalk(color) {
  const key = `${color} ${ratio}`;
  if (!chalkPatterns.has(key)) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = Math.round(GRAIN * ratio);
    const t = tile.getContext('2d');
    t.filter = chalkFilter();
    t.fillStyle = color;
    t.fillRect(0, 0, tile.width, tile.height);
    const pattern = ctx.createPattern(tile, 'repeat');
    pattern.setTransform(new DOMMatrix().scaleSelf(1 / ratio)); // the tile is in canvas pixels
    chalkPatterns.set(key, pattern);
  }
  return chalkPatterns.get(key);
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
