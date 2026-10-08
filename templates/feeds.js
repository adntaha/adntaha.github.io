import { html, raw } from '../lib/html.js';

// Atom feed at /feed.xml, the same address the old Jekyll blog used, so
// existing subscribers keep receiving posts.
export function feed(site, posts) {
  const abs = (url) => new URL(url, site.url).href;
  return html`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${site.title}</title>
  <subtitle>${site.description}</subtitle>
  <link href="${abs('/feed.xml')}" rel="self"/>
  <link href="${abs('/')}"/>
  <id>${abs('/')}</id>
  <updated>${new Date(posts[0]?.date ?? Date.now()).toISOString()}</updated>
  <author><name>${site.author}</name></author>
${posts.map(
  (post) => html`  <entry>
    <title>${post.title}</title>
    <link href="${abs(post.url)}"/>
    <id>${abs(post.url)}</id>
    <published>${new Date(post.date).toISOString()}</published>
    <updated>${new Date(post.updated ?? post.date).toISOString()}</updated>
    ${post.description ? html`<summary>${post.description}</summary>` : ''}
    <content type="html">${post.html}</content>
  </entry>
`,
)}</feed>
`;
}

export function sitemap(site, urls) {
  return html`<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => html`  <url><loc>${new URL(url, site.url).href}</loc></url>
`)}</urlset>
`;
}

export const robots = (site) => raw(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`);
