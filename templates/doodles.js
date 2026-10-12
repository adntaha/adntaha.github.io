// Hand-drawn doodles for the homepage margins, as SVG path data: the stars
// and the arrows from notes to posts. They're generated rather than drawn,
// but traced the way you'd dash them off with a mouse: lines that bow to one
// side and are never quite straight. Each takes a seed (any number), so a
// doodle comes out the same on every build while different seeds differ.
// Styled by "Doodles" in style.css.

// mulberry32: a tiny repeatable random number generator. Returns a function
// giving a random number between -amount and amount.
function wobbler(seed) {
  return (amount) => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((((t ^ (t >>> 14)) >>> 0) / 4294967296) - 0.5) * 2 * amount;
  };
}

// The points of a line from `from` to `to` (not including `from`): bowed to
// one side by up to `bow`, and traced as short straight hops that drift a
// little off course.
function trace(wobble, [x0, y0], [x3, y3], bow) {
  const length = Math.hypot(x3 - x0, y3 - y0);
  const [nx, ny] = [-(y3 - y0) / length, (x3 - x0) / length]; // across the line
  const push = wobble(bow);
  // Two control points pushed off to the same side make the bow (a cubic Bézier).
  const [x1, y1] = [x0 + (x3 - x0) / 3 + nx * push + wobble(bow / 4), y0 + (y3 - y0) / 3 + ny * push + wobble(bow / 4)];
  const [x2, y2] = [x0 + ((x3 - x0) * 2) / 3 + nx * push + wobble(bow / 4), y0 + ((y3 - y0) * 2) / 3 + ny * push + wobble(bow / 4)];
  const points = [];
  const hops = Math.ceil(length / 3.5);
  let drift = 0;
  for (let h = 1; h <= hops; h++) {
    const t = h / hops;
    const u = 1 - t;
    const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
    const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
    drift = drift * 0.6 + wobble(0.8);
    points.push([x + nx * drift, y + ny * drift]);
  }
  return points;
}

const pathData = ([first, ...rest]) => `M${first.map((v) => v.toFixed(1)).join(' ')}L${rest.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}`;

// A five-pointed star in one stroke, in a 100×100 box: lopsided points, and an
// ending that overshoots the start.
export function messyStar(seed) {
  const wobble = wobbler(seed);
  // The points in the order a hand draws them: top, bottom right, left,
  // right, bottom left, and back to the top...
  const corners = [0, 2, 4, 1, 3, 0].map((i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [50 + 42 * Math.cos(angle) + wobble(10), 52 + 42 * Math.sin(angle) + wobble(10)];
  });
  // ...carrying on a little past the start.
  const [[ax, ay], [bx, by]] = corners.slice(-2);
  corners[5] = [bx + (bx - ax) * 0.22, by + (by - ay) * 0.22];

  const points = [corners[0]];
  for (let i = 1; i < corners.length; i++) points.push(...trace(wobble, corners[i - 1], corners[i], 15));
  return pathData(points);
}

// An arrow pointing left, in two parts so it can stretch to any length: the
// head, a single "<" stroke in a 14×24 box with its tip at the left; and the
// shaft, a slightly bowed line across a 100×24 box that's stretched to fit.
export function messyArrow(seed) {
  const wobble = wobbler(seed);
  const tip = [1.5, 12 + wobble(1.5)];
  const barbs = [
    [12 + wobble(1.5), 4 + wobble(2)],
    [11 + wobble(1.5), 20 + wobble(2)],
  ];
  const head = [barbs[0], ...trace(wobble, barbs[0], tip, 1.5), ...trace(wobble, tip, barbs[1], 1.5)];
  const start = [0, tip[1]];
  const shaft = [start, ...trace(wobble, start, [99, 12 + wobble(1.5)], 5)]; // tail level with the tip
  return { head: pathData(head), shaft: pathData(shaft) };
}
