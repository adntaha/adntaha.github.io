// The margin stars on the homepage (see home.js and src/css/doodles.css)
// draw themselves, quickly, once you've scrolled far enough to see them, and
// stay drawn when you scroll back up. The first is already in view when the
// page opens; CSS draws that one.

const middle = document.querySelector('.doodle.star-2 path');
const last = document.querySelector('.doodle.star-3 path');
const waiting = new Set([middle, last]);

function show(path) {
  waiting.delete(path);
  path.style.strokeDashoffset = '0';
  path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
    duration: 400,
    easing: 'ease-out',
  });
}

// A star draws once it's well into the window (its top 30% of the way up from
// the bottom), so it isn't over before you've noticed it...
const inView = (path) => path.ownerSVGElement.getBoundingClientRect().top < innerHeight * 0.7;

function check() {
  if (waiting.has(middle) && inView(middle)) show(middle);
  // ...except the last, which is near the bottom of the page and may never
  // get that high: it also draws once you're within 80px of the bottom.
  const end = document.documentElement.scrollHeight - innerHeight;
  if (waiting.has(last) && (inView(last) || scrollY >= end - 80)) show(last);
  if (waiting.size === 0) {
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', check);
  }
}

let queued = false;
function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    check();
  });
}

// Hidden on narrow screens; not animated for anyone who'd rather less motion.
const visible = middle && last && middle.ownerSVGElement.getBoundingClientRect().width > 0;
if (visible && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // CSS has them undrawn already, so they don't flash up before this runs.
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', check);
  check();
}
