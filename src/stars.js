// The margin stars on the homepage (see home.js and "Doodles" in style.css)
// draw themselves as you scroll down, and stay drawn when you scroll back up.
// The first is already in view when the page opens; CSS draws that one.

const middle = document.querySelector('.doodle.star-2 path');
const last = document.querySelector('.doodle.star-3 path');
const drawn = new Map([[middle, 0], [last, 0]]); // how far each has got, 0 to 1

const clamp = (n) => Math.min(1, Math.max(0, n));

function show(path, progress) {
  const furthest = Math.max(drawn.get(path), clamp(progress));
  drawn.set(path, furthest);
  path.style.strokeDashoffset = String(1 - furthest);
}

function draw() {
  // A star starts when it reaches the middle of the window and is done once
  // it's a quarter of the way down from the top...
  const { top, height } = middle.ownerSVGElement.getBoundingClientRect();
  show(middle, (innerHeight * 0.5 - top) / (innerHeight * 0.25 + height));
  // ...except the last, which is near the bottom of the page and may never
  // get that high: it draws over the final 250px of scrolling, and is done
  // 25px before the bottom.
  const end = document.documentElement.scrollHeight - innerHeight;
  show(last, (scrollY - (end - 250)) / 225);
}

// Hidden on narrow screens; not animated for anyone who'd rather less motion.
const visible = middle && last && middle.ownerSVGElement.getBoundingClientRect().width > 0;
if (visible && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const path of drawn.keys()) path.style.strokeDasharray = '1';
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  }, { passive: true });
  addEventListener('resize', draw);
  draw();
}
