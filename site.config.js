// Everything that identifies the site lives here, so moving to a new domain
// or changing a link is a one-line edit.

export default {
  // Absolute URL, used only where relative links aren't allowed (feed, sitemap, social cards).
  url: 'https://adntaha.github.io',
  title: 'Aidan Taha',
  description:
    'Aidan Taha studies computer science and statistics at McGill, researches how language models behave, and builds things.',
  author: 'Aidan Taha',
  locale: 'en-CA',
  location: 'Montréal',

  // Taken from the old Jekyll _config.yml, where it was already public.
  email: 'adnanaidantaha@gmail.com',

  // Quieter links, shown under the intro and in the footer.
  elsewhere: [
    { label: 'GitHub', url: 'https://github.com/adntaha' },
    { label: 'X', url: 'https://x.com/adntaha_ai' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/adntaha' },
    { label: 'Devpost', url: 'https://devpost.com/adntaha' },
  ],

  // Optional. Drop an image in public/images/ and set e.g. { src: '/images/portrait.jpg', alt: '…' }.
  portrait: null,

  // Optional. Set to '/resume.pdf' once a public version is in public/.
  resume: null,

  // Loaded only in production builds, so local development doesn't count as visits.
  analytics: {
    src: 'https://shy-wildflower-2799.botato.workers.dev/seeds.js',
    websiteId: '2ccfe685-560d-4989-9c47-e09bd0f6bccb',
  },

  // Old Jekyll pages that no longer exist, pointed somewhere useful.
  redirects: {
    '/posts/': '/blog/',
    '/categories/': '/blog/',
    '/tags/': '/blog/',
    '/year-archive/': '/blog/',
    '/page2/': '/blog/',
  },
};
