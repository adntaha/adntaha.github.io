// Everything that identifies the site lives here, so moving to a new domain
// or changing a link is a one-line edit.

import fs from 'node:fs';
import YAML from 'yaml';

// make the description a copy of the intro
const { intro } = YAML.parse(fs.readFileSync(new URL('./content/home.yml', import.meta.url), 'utf8'));
const plain = (markdown) =>
  markdown
    .replace(/\{\w+\}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*+/g, '');

export default {
  url: 'https://adntaha.github.io', // absolute url, used for the rss feed, sitemap, social cards, etc.
  title: 'Aidan Taha',
  description: plain(intro),
  author: 'Aidan Taha',
  locale: 'en-CA',
  location: 'montréal',

  // shown in the intro
  links: [
    { label: 'github', url: 'https://github.com/adntaha' },
    { label: 'twitter', url: 'https://x.com/adntaha_ai' },
    { label: 'email', url: 'mailto:adnanaidantaha@gmail.com' },
    { label: 'résumé', url: '/resume.pdf' }
  ],

  // e.g. { src: '/images/portrait.jpg', alt: '…' }.
  portrait: null,

  // loaded only in production builds
  analytics: {
    src: 'https://shy-wildflower-2799.botato.workers.dev/seeds.js',
    websiteId: '2ccfe685-560d-4989-9c47-e09bd0f6bccb',
  },

  // old jekyll pages
  redirects: {
    '/posts/': '/blog/',
    '/categories/': '/blog/',
    '/tags/': '/blog/',
    '/year-archive/': '/blog/',
    '/page2/': '/blog/',
  },
};
