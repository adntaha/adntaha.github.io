// Local development: serves dist/ at http://localhost:4000, rebuilds when
// anything in WATCH changes, and reloads open tabs. No dependencies, just Node.
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
    res.flushHeaders(); // so the tab knows it's connected straight away
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


// Watching for changes: every 300ms, compare each watched file's modification
// time and size with the last look, and rebuild if anything was added, edited
// or deleted. (fs.watch would be instant, but it misses edits made from
// Windows to files under WSL's /mnt/c, and on Windows it reports a "change"
// whenever a file is merely read. Polling a few dozen files is cheap.)
function snapshot() {
  const seen = new Map();
  const visit = (file) => {
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      return; // deleted mid-scan
    }
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file)) visit(path.join(file, name));
    } else {
      seen.set(file, `${stat.mtimeMs}:${stat.size}`);
    }
  };
  WATCH.forEach(visit);
  return seen;
}

function changed(before, after) {
  if (before.size !== after.size) return true;
  for (const [file, stamp] of after) if (before.get(file) !== stamp) return true;
  return false;
}

// The first look comes before the first build, so a file saved while that
// build runs still counts as a change.
let last = snapshot();
build();
server.listen(PORT, () => console.log(`\nhttp://localhost:${PORT}`));

setInterval(() => {
  const now = snapshot();
  if (!changed(last, now)) return;
  last = now; // taken before the build, so anything saved during it is caught next time
  build();
}, 300);
