// Opens project pages in a side panel on the homepage, so you can look at a
// project without losing your place.
//
// Every project is a real page. This script only borrows its <article>:
//   - the URL changes to the project's, so it can be shared or reloaded;
//   - Back (or Esc, or ✕, or clicking outside) closes the panel;
//   - ctrl/cmd-click, middle-click, and no-JS visitors just get the page.

const dialog = document.getElementById('aside');
const body = dialog.querySelector('.aside-body');
const fullPageLink = dialog.querySelector('.aside-full');
const homeTitle = document.title;
const pages = new Map(); // url → Promise of { title, html }

function load(url) {
  if (!pages.has(url)) {
    const page = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return { title: doc.title, html: doc.querySelector('[data-aside-content]').outerHTML };
      });
    page.catch(() => pages.delete(url)); // let a later attempt retry
    pages.set(url, page);
  }
  return pages.get(url);
}

async function show(url) {
  let page;
  try {
    page = await load(url);
  } catch {
    location.href = url; // if anything goes wrong, the real page still works
    return;
  }
  body.innerHTML = page.html;
  fullPageLink.href = url;
  document.title = page.title;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function hide() {
  body.querySelectorAll('video').forEach((video) => video.pause());
  dialog.close();
  document.title = homeTitle;
}

// Closing always goes through history, so Back and ✕ do the same thing.
function requestClose() {
  if (history.state?.aside) history.back();
  else hide();
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-aside]');
  const newTab = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  if (!link || newTab) return;
  event.preventDefault();
  history.pushState({ aside: link.pathname }, '', link.pathname);
  show(link.pathname);
});

// Start downloading as soon as someone shows intent, so opening feels instant.
for (const type of ['pointerenter', 'focusin', 'touchstart']) {
  document.addEventListener(
    type,
    (event) => {
      const link = event.target.closest?.('a[data-aside]');
      if (link) load(link.pathname).catch(() => {});
    },
    { capture: true, passive: true },
  );
}

window.addEventListener('popstate', (event) => {
  if (event.state?.aside) show(event.state.aside);
  else if (dialog.open) hide();
});

dialog.querySelector('.aside-close').addEventListener('click', requestClose);

// Esc: let history do the closing instead of the browser closing the dialog directly.
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  requestClose();
});

// Clicks on the backdrop are reported on the <dialog> itself; check that the
// click really was outside the panel, not on an empty bit of it.
dialog.addEventListener('click', (event) => {
  const box = dialog.getBoundingClientRect();
  const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  if (event.target === dialog && outside) requestClose();
});
