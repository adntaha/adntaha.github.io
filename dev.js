// Local development: serves dist/ at http://localhost:4000, rebuilds when
// anything changes, and reloads open tabs. No dependencies, just Node.
//
// Each rebuild runs build.js in a fresh process. That takes a fraction of a
// second and guarantees edited templates are picked up (Node caches imports).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PORT = Number(process.env.PORT ?? 4000);
const WATCH = ['content', 'templates', 'src', 'public', 'lib', 'site.config.js', 'build.js'];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

// Tabs listen on /__reload (server-sent events); we ping them after each build.
const listeners = new Set();
const reloadScript = `<script>new EventSource('/__reload').onmessage = () => location.reload()</script>`;

function build() {
  const result = spawnSync(process.execPath, ['build.js', '--dev'], { stdio: 'inherit' });
  if (result.status === 0) for (const res of listeners) res.write('data: reload\n\n');
}

const server = http.createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    listeners.add(res);
    req.on('close', () => listeners.delete(res));
    return;
  }

  let file = path.join('dist', decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!path.resolve(file).startsWith(path.resolve('dist'))) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  const found = fs.existsSync(file);
  if (!found) file = path.join('dist', '404.html');

  const type = types[path.extname(file)] ?? 'application/octet-stream';
  let body = fs.readFileSync(file);
  if (type.startsWith('text/html')) body = body.toString().replace('</body>', `${reloadScript}</body>`);
  res.writeHead(found ? 200 : 404, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
});

build();
server.listen(PORT, () => console.log(`\nhttp://localhost:${PORT}`));

// On Windows, watching a single file reports a "change" every time it's merely
// read, and every build reads build.js and site.config.js. Without this check
// each build would trigger the next one. So: only rebuild if the file's
// modification time actually moved.
const mtimes = new Map();
function modified(file) {
  try {
    const mtime = fs.statSync(file).mtimeMs;
    if (mtimes.get(file) === mtime) return false;
    mtimes.set(file, mtime);
  } catch {
    mtimes.delete(file); // deleted counts as modified
  }
  return true;
}
WATCH.forEach(modified);

// Editors often save in several steps; wait for a quiet moment before rebuilding.
let timer;
for (const target of WATCH) {
  const isDir = fs.statSync(target).isDirectory();
  fs.watch(target, { recursive: true }, (event, name) => {
    if (!modified(isDir && name ? path.join(target, name) : target)) return;
    clearTimeout(timer);
    timer = setTimeout(build, 50);
  });
}
