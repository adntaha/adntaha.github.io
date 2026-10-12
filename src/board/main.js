// The board: pick up a marker (or chalk) from the tray in the corner and draw
// anywhere on the page. The drawing goes on the board itself, behind the typed
// text and pictures; the eraser rubs out your drawing, and the handwritten
// notes and doodles in the margin too. Nothing is saved: refresh, and the
// board is clean again. Until someone picks up a tool, none of it exists.
//
//   main.js    this: the tool in hand, and the pointer
//   tools.js   the tools, the tray and the cursors
//   paint.js   the canvas, strokes, repainting, smudging and chalk
//   frames.js  coordinates (page, and frames pinned to the text)
//   notes.js   where the margin notes and their letters are

import { dark, tray, renderTray, cursorFor, available, LINE, ERASER } from './tools.js';
import { Frame, frameAt, remeasure } from './frames.js';
import { strokes, stroke, addPoint, around, smudges, createBoard, hasBoard, resize, repaint, queueRepaint, pickUp } from './paint.js';

const SCRUB = -0.5; // doubling back by more than ~120° starts a new eraser pass

let tool = { kind: 'cursor' };
let current = null; // the stroke being drawn

function use(next) {
  tool = available(next) ? next : { kind: 'cursor' };
  tray.classList.remove('is-open');
  const drawing = tool.kind !== 'cursor';
  if (drawing && !hasBoard()) {
    createBoard();
    addEventListener('pointerdown', start);
    addEventListener('pointermove', move);
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
  }
  document.documentElement.classList.toggle('is-drawing', drawing);
  setPointer();
  renderTray(tool, use);
}

const setPointer = (pressed = false) => document.documentElement.style.setProperty('--pen', cursorFor(tool, pressed));

// --- The pointer. While a tool is in hand the page ignores it (no link
// hovers, no clicks; see html.is-drawing in style.css), and these get it instead.

function start(event) {
  if (tool.kind === 'cursor' || event.composedPath().includes(tray) || event.button > 0) return;
  event.preventDefault(); // no text selection, no focus
  try {
    document.documentElement.setPointerCapture(event.pointerId); // keep drawing even off the window's edge
  } catch {}
  setPointer(true);
  remeasure();
  takeDoodles();
  const frame = frameAt(event.pageY);
  begin(frame, ...frame.fromPage(event.pageX, event.pageY));
  queueRepaint(frame.rectToPage(around(current.box, current.width)));
}

// A new stroke at (x, y), in its frame's coordinates.
function begin(frame, x, y) {
  const erase = tool.kind === 'eraser';
  current = stroke({ erase, chalk: dark.matches, color: tool.color, width: erase ? ERASER : LINE, frame, points: [x, y] });
  // A chalk eraser smears whatever was under it before this pass. That never
  // changes, so it's picked up once, now, rather than on every move.
  if (smudges(current)) current.smear = pickUp(frame);
  strokes.push(current);
}

function move(event) {
  if (!current) return;
  for (const e of event.getCoalescedEvents?.() ?? [event]) {
    const [px, py] = current.points.slice(-2);
    const [x, y] = current.frame.fromPage(e.pageX, e.pageY);
    const length = Math.hypot(x - px, y - py);
    if (length < 0.5) continue;
    const heading = [(x - px) / length, (y - py) / length];
    // The eraser doubled back: that's a new pass over the same spot.
    if (current.erase && current.heading && heading[0] * current.heading[0] + heading[1] * current.heading[1] < SCRUB) {
      begin(current.frame, px, py);
    }
    current.heading = heading;
    addPoint(current, x, y);
    const segment = [Math.min(px, x), Math.min(py, y), Math.max(px, x), Math.max(py, y)];
    queueRepaint(current.frame.rectToPage(around(segment, current.width)));
  }
}

function end() {
  current = null;
  setPointer();
}

// --- The doodles in the margins (stars and arrows; see templates/doodles.js)
// start out as SVG drawings. Once someone picks up a tool, each one that's
// fully drawn becomes ordinary strokes on the board, so it can be drawn over,
// erased and smudged like anything else. Stars still drawing themselves in
// are left alone for now.

function takeDoodles() {
  for (const svg of document.querySelectorAll('.doodle:not(.on-board)')) {
    const paths = [...svg.querySelectorAll('path')];
    const stillDrawing = paths.some((path) => parseFloat(getComputedStyle(path).strokeDashoffset) > 0.001);
    if (!svg.getBoundingClientRect().width || stillDrawing) continue;
    const frame = new Frame(svg);
    for (const path of paths) {
      const style = getComputedStyle(path);
      const toScreen = path.getScreenCTM();
      const length = path.getTotalLength();
      const steps = Math.ceil(length / 2); // a point every couple of units is plenty
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const p = path.getPointAtLength((length * i) / steps).matrixTransform(toScreen);
        points.push(...frame.fromPage(p.x + scrollX, p.y + scrollY));
      }
      const line = stroke({ chalk: dark.matches, color: style.stroke, width: parseFloat(style.strokeWidth), frame, points });
      strokes.unshift(line); // it was there before anything you drew
      repaint(frame.rectToPage(around(line.box, line.width)));
    }
    svg.classList.add('on-board');
  }
}

// --- Keys and theme

addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && tool.kind !== 'cursor') use({ kind: 'cursor' });
});

dark.addEventListener('change', () => {
  use(tool); // puts down a colour the other board doesn't have, and redraws the tray
  if (hasBoard()) resize();
});

renderTray(tool, use);
