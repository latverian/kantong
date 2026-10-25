// Serves dist/ and applies dist/_headers the way Cloudflare Pages does, to test security headers locally.
// Usage: npm run serve:secure   (after npm run build)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [root, port] = [process.argv[2], Number(process.argv[3] ?? 4174)];
const rules = [];
let cur = null;
for (const line of fs.readFileSync(path.join(root, '_headers'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (!line.startsWith(' ')) rules.push((cur = { pattern: line.trim(), headers: [] }));
  else { const i = line.indexOf(':'); cur.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
}
const match = (p, u) => (p.endsWith('/*') ? u.startsWith(p.slice(0, -1)) : p === u);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(root, url === '/' ? 'index.html' : url);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  for (const r of rules) if (match(r.pattern, url)) for (const [k, v] of r.headers) res.setHeader(k, v);
  res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
  res.end(fs.readFileSync(file));
}).listen(port, () => console.log('serving with headers on', port));
