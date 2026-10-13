// The tools, and the tray in the bottom-right corner that holds them: markers
// on the whiteboard (light mode) or chalk on the blackboard (dark mode), an
// eraser, and the ordinary cursor. A tool is { kind: 'cursor' },
// { kind: 'eraser' } or { kind: 'ink', color }.

export const dark = matchMedia('(prefers-color-scheme: dark)');

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

export const LINE = 2.75; // the same thickness as the doodles' stroke (.doodle in src/css/doodles.css)
export const ERASER = 28;

// The blackboard's eraser is your hand: pointing while you hover, flat while
// you wipe.
const PALM = '✋';
const FINGER = '👆';
const EMOJI_FONTS = `'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif`;

const palette = () => PALETTES[dark.matches ? 'dark' : 'light'];

// Does this tool exist on the current board? (Each colour belongs to one board.)
export function available(tool) {
  return tool.kind !== 'ink' || palette().some(([, color]) => color === tool.color);
}

// --- The tray. Each tool is drawn as the top half of a stick of chalk (or a
// marker) poking up diagonally out of the tray, like the pens in Apple Notes.

export const tray = document.createElement('div');
tray.className = 'tray';
tray.setAttribute('role', 'toolbar');
tray.setAttribute('aria-label', 'Draw on this page');
document.body.append(tray);

// Fill the tray for the tool in hand; picking a tool calls onPick(tool).
export function renderTray(inHand, onPick) {
  const choices = [
    ['Cursor', { kind: 'cursor' }],
    [dark.matches ? 'Hand' : 'Tissue', { kind: 'eraser' }],
    ...palette().toReversed().map(([label, color]) => [label, { kind: 'ink', color }]),
  ].map(([label, tool]) => {
    const b = button(label, icon(tool), () => onPick(tool));
    b.setAttribute('aria-pressed', String(tool.kind === inHand.kind && tool.color === inHand.color));
    return b;
  });
  // The first button shows the tool in hand. The tray lays out right to left,
  // so it sits in the corner, and the choices open out to its left.
  const handle = button('Drawing tools', icon(inHand), () => tray.classList.toggle('is-open'));
  handle.classList.add('tray-current');
  tray.replaceChildren(handle, ...choices);
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

// The pointer for a tool: a dot of the marker's colour, your hand on the
// blackboard (a pointing finger, then a flat palm while `pressed`), or the
// tissue's outline on the whiteboard.
export function cursorFor({ kind, color }, pressed = false) {
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
