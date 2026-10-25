// Generates the app icons in public/icons (macOS `sips` does the resizing).
// If design/logo/app-icon.png exists it is used; otherwise the built-in placeholder SVG is drawn.
// Usage: npm run icons
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('public/icons');
const logoDir = path.resolve('design/logo');
const customIcon = path.join(logoDir, 'app-icon.png');
const customMaskable = path.join(logoDir, 'app-icon-maskable.png');
fs.mkdirSync(out, { recursive: true });

const tmp = path.join(out, '.tmp');
fs.mkdirSync(tmp, { recursive: true });

const resize = (src, size, name) =>
  execFileSync('sips', ['-s', 'format', 'png', '-z', String(size), String(size), src, '--out', path.join(out, name)], { stdio: 'ignore' });

const sizeOf = (file) => {
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]).toString();
  return [Number(/pixelWidth: (\d+)/.exec(info)[1]), Number(/pixelHeight: (\d+)/.exec(info)[1])];
};

let icon;
let maskable;
if (fs.existsSync(customIcon)) {
  const [w, h] = sizeOf(customIcon);
  if (w !== h) throw new Error(`design/logo/app-icon.png must be square (got ${w}×${h})`);
  if (w < 512) console.warn(`warning: app-icon.png is ${w}px; 1024px is recommended`);
  icon = customIcon;
  maskable = fs.existsSync(customMaskable) ? customMaskable : customIcon;
  console.log('using design/logo/app-icon.png');
} else {
  // Placeholder: wallet with two cards peeking out (blue = IDR, violet = NTD).
  const art = `
  <rect x="128" y="104" width="208" height="128" rx="28" fill="#0369A1" transform="rotate(-8 232 168)"/>
  <rect x="184" y="120" width="208" height="128" rx="28" fill="#7C3AED" transform="rotate(6 288 184)"/>
  <rect x="88" y="184" width="336" height="232" rx="52" fill="#FFFFFF"/>
  <rect x="300" y="262" width="156" height="84" rx="42" fill="#111827"/>
  <circle cx="342" cy="304" r="16" fill="#FFFFFF"/>`;
  const svg = (scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#111827"/>
  <g transform="translate(${256 * (1 - scale)} ${256 * (1 - scale)}) scale(${scale})">${art}</g>
</svg>`;
  icon = path.join(tmp, 'icon.svg');
  maskable = path.join(tmp, 'maskable.svg');
  fs.writeFileSync(icon, svg());
  fs.writeFileSync(maskable, svg(0.78)); // keep art inside the maskable safe zone
  console.log('no design/logo/app-icon.png yet, using the placeholder icon');
}

resize(icon, 512, 'icon-512.png');
resize(icon, 192, 'icon-192.png');
resize(icon, 180, 'apple-touch-icon.png');
resize(icon, 64, 'favicon.png');
resize(maskable, 512, 'icon-maskable-512.png');
fs.rmSync(path.join(out, 'favicon.svg'), { force: true });
fs.rmSync(tmp, { recursive: true, force: true });
console.log('icons written to', out);
