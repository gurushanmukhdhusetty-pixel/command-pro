// Renders photoreal studio images for every product & bullion item.
// Usage: npx vite --port 5199 &  then  node scripts/render-products.cjs [ids...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.RENDER_BASE || 'http://localhost:5199';
const OUT = path.join(__dirname, '..', 'renders-raw');
const SIZE = +(process.env.SIZE || 1400);
const VIEWS = (process.env.VIEWS || '0,1,2').split(',').map(Number);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let ids = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
  for (const id of ids) {
    for (const view of VIEWS) {
      const file = path.join(OUT, `${id}-${view + 1}.png`);
      if (fs.existsSync(file) && !process.env.FORCE) continue;
      const t0 = Date.now();
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', (e) => errs.push(e.message));
      pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
      await pg.goto(`${BASE}/render.html?id=${encodeURIComponent(id)}&view=${view}&size=${SIZE}`);
      try {
        await pg.waitForFunction(() => window.__RENDER_READY === true, null, { timeout: 240000 });
      } catch (e) {
        console.log('TIMEOUT', id, view, errs.slice(0, 3));
        await pg.close();
        continue;
      }
      const data = await pg.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
      fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
      console.log(`${id}-${view + 1}`, ((Date.now() - t0) / 1000).toFixed(1) + 's', errs.length ? errs.slice(0, 2) : '');
      await pg.close();
    }
  }
  await b.close();
})();
