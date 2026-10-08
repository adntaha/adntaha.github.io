// Loads a folder of Markdown files. Each file starts with a YAML block
// ("frontmatter") between --- lines, followed by the Markdown body.

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { render } from './markdown.js';

export function loadCollection(dir, { urlPrefix }) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const source = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n');
      const [, frontmatter = '', body = source] = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
      const slug = file.replace(/\.md$/, '');
      const html = render(body, { idPrefix: `mn-${slug}` });

      return {
        slug,
        url: `${urlPrefix}/${slug}/`,
        file: `${dir}/${file}`,
        ...YAML.parse(frontmatter),
        html,
        hasMath: html.includes('class="katex'),
        // "<!-- TODO … -->" in the body or "# TODO …" in the frontmatter marks
        // something that still needs a decision. The build lists them all.
        todos: [
          ...[...frontmatter.matchAll(/#\s*TODO:?\s*(.*)/g)].map((m) => m[1].trim()),
          ...[...body.matchAll(/<!--\s*TODO:?\s*([\s\S]*?)-->/g)].map((m) => m[1].trim()),
        ],
      };
    });
}
