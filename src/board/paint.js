// The board itself: one canvas the size of the whole page, so it scrolls with
// the page for free, and the strokes on it. The canvas sits under the typed
// text but over the margin notes (see src/css/board.css), so the eraser
// can rub the notes out by painting board colour over them.
//
// Repainting a rectangle means clearing it and replaying every stroke that
// crosses it, in order. Strokes keep their points in frame coordinates (see
// frames.js), and are turned into page coordinates as they're painted.

import { remeasure } from './frames.js';
import { noteArea, noteLetters, forgetLetters } from './notes.js';
import { ERASER } from './tools.js';

// One pass of the eraser wipes a whiteboard clean. Chalk smudges instead: each
// pass smears what's under the eraser into a haze about a third as strong, so
// the first pass leaves a smudge and the second a faint ghost.
const SMUDGE = 0.3;
const SMEAR = 6; // how far chalk dust spreads when smeared, in px
const NOTE_DUST = 0.5; // how much of a note's chalk survives being smeared
// A smear of the drawing is kept at a quarter of the resolution; drawn back up
// with smooth scaling, that's the blur (much cheaper than a blur filter).
const SNAPSHOT_SCALE = 0.25;
// Big canvases are memory-hungry (and Safari refuses ones over ~16 million
// pixels), so very long pages get a slightly softer drawing instead.
const MAX_PIXELS = 12e6;

export const strokes = []; // oldest first; see stroke()
let board = null; // the canvas, once someone picks up a tool
let ratio = 1; // canvas pixels per CSS pixel

// erase: is this an eraser pass? chalk: was it made on the blackboard (chalk
// drawing, smudgy erasing) or the whiteboard? frame: what its points are
// measured from. box: the points' bounding box, in the same coordinates.
export function stroke({ erase = false, chalk, color, width, frame, points }) {
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i < points.length; i += 2) grow(box, points[i], points[i + 1]);
  return { erase, chalk, color, width, frame, points, box, heading: null, smear: null };
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

export const smudges = (s) => s.erase && s.chalk;

// --- The canvas

export function createBoard() {
  if (board) return;
  board = document.createElement('canvas');
  board.className = 'board';
  board.setAttribute('aria-hidden', 'true');
  document.body.append(board);
  resize();
  new ResizeObserver(resize).observe(document.body);
}

export const hasBoard = () => board !== null;

// The canvas covers the whole page; when the page changes size, so does it.
export function resize() {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.scrollHeight;
  ratio = Math.min(devicePixelRatio, 2, Math.sqrt(MAX_PIXELS / (width * height)));
  board.width = Math.round(width * ratio);
  board.height = Math.round(height * ratio);
  board.style.width = `${width}px`;
  board.style.height = `${height}px`;
  forgetLetters(); // the notes may have moved
  repaint([0, 0, width, height]);
}

// Pointer events can come several times a frame; gather the rectangles (in
// page coordinates) that need repainting and do them once, before the next frame.
let dirty = null;
export function queueRepaint(area) {
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

// Redraw one rectangle of the page (in page coordinates).
export function repaint(area) {
  remeasure();
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
    const [l, t, r, b] = s.frame.rectToPage(around(s.box, s.width + 2 * SMEAR));
    if (r < left || l > right || b < top || t > bottom) continue;
    const path = pathOnPage(s);
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

// A stroke as a path in page coordinates.
function pathOnPage(s) {
  const [ox, oy] = s.frame.origin();
  const { points } = s;
  const path = new Path2D();
  path.moveTo(points[0] + ox, points[1] + oy);
  // A single click still leaves a dot.
  if (points.length === 2) path.lineTo(points[0] + ox + 0.1, points[1] + oy);
  for (let i = 2; i < points.length; i += 2) path.lineTo(points[i] + ox, points[i + 1] + oy);
  return path;
}

// --- Smudging

// What a chalk eraser picks up as a pass starts, smeared. Each part is
// { source: a canvas, rect: what it covers, frame }, with the rectangle in the
// eraser stroke's frame, so it stays put like the stroke does:
//   drawing: the chalk on the visible part of the board, at low resolution;
//   handwriting: whatever handwriting still shows in the notes there, blurred.
//     Letters need full resolution to smudge believably, but the notes are
//     small, so this only covers them (and is null if none are in view).
export function pickUp(frame) {
  const pad = ERASER + SMEAR; // an eraser's width and its smear, past the window's edges
  const view = [
    Math.max(0, scrollX - pad),
    Math.max(0, scrollY - pad),
    Math.min(board.width / ratio, scrollX + innerWidth + pad),
    Math.min(board.height / ratio, scrollY + innerHeight + pad),
  ];
  const kept = (picked) => picked && { source: picked.source, rect: frame.rectFromPage(picked.rect), frame };
  return {
    drawing: kept(shrunkenDrawing(view)),
    handwriting: kept(smearedLetters(noteLetters(view))),
  };
}

function shrunkenDrawing([l, t, r, b]) {
  const drawing = canvasOfSize(Math.ceil((r - l) * SNAPSHOT_SCALE), Math.ceil((b - t) * SNAPSHOT_SCALE));
  // Shrinking with the best filtering averages the chalk's grain into a haze
  // (without it, the grain is sampled into dashes).
  drawing.imageSmoothingQuality = 'high';
  drawing.drawImage(board, l * ratio, t * ratio, (r - l) * ratio, (b - t) * ratio, 0, 0, drawing.canvas.width, drawing.canvas.height);
  return { source: drawing.canvas, rect: [l, t, r, b] };
}

function smearedLetters(letters) {
  if (!letters.length) return null;
  const l = Math.min(...letters.map((x) => x.left)) - SMEAR * 2;
  const t = Math.min(...letters.map((x) => x.top)) - SMEAR * 2;
  const r = Math.max(...letters.map((x) => x.right)) + SMEAR * 2;
  const b = Math.max(...letters.map((x) => x.bottom)) + SMEAR * 2;
  const [w, h] = [Math.ceil((r - l) * ratio), Math.ceil((b - t) * ratio)];

  // The letters as dust...
  const dust = canvasOfSize(w, h);
  dust.setTransform(ratio, 0, 0, ratio, -l * ratio, -t * ratio);
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
  dust.drawImage(board, l * ratio, t * ratio, w, h, 0, 0, w, h);
  // ...then smeared.
  const smeared = canvasOfSize(w, h);
  smeared.filter = `blur(${(SMEAR / 2) * ratio}px)`;
  smeared.drawImage(dust.canvas, 0, 0);
  return { source: smeared.canvas, rect: [l, t, r, b] };
}

function canvasOfSize(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d');
}

// The part of a picked-up smear that falls along an eraser's path, within one
// repainted rectangle (page coordinates): a canvas covering that rectangle,
// or null if there's nothing to smear.
const scratch = [document.createElement('canvas'), document.createElement('canvas')];
function footprint(picked, path, width, [left, top, right, bottom], which) {
  if (!picked) return null;
  const canvas = scratch[which];
  canvas.width = Math.ceil((right - left) * ratio); // also clears it
  canvas.height = Math.ceil((bottom - top) * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
  ctx.imageSmoothingQuality = 'high';
  const [l, t, r, b] = picked.frame.rectToPage(picked.rect);
  ctx.drawImage(picked.source, l, t, r - l, b - t);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.lineWidth = width;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.stroke(path);
  return canvas;
}

// --- Chalk: drawn with a tile of grain made by the same #chalk filter that
// src/css/layout.css gives the handwriting (it's defined in templates/layout.js), so
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
