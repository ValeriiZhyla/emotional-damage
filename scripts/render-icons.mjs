import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Preserve the approved artwork; only resize it for platform icon slots.
const directory = new URL('../public/icons/', import.meta.url);
const source = await readFile(new URL('../assets/heart-gauge.png', import.meta.url));
const image = `data:image/png;base64,${source.toString('base64')}`;
const browser = await chromium.launch();
try {
  for (const [name, size, scale] of [
    ['icon-64.png', 64, 1],
    ['apple-touch-icon.png', 180, 1],
    ['icon-192.png', 192, 1],
    ['icon-512.png', 512, 1],
    ['icon-maskable-512.png', 512, 0.8],
  ]) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<style>body{margin:0;background:#000;display:grid;place-items:center;height:100vh}img{display:block;width:${scale * 100}vw;height:${scale * 100}vh}</style><img src="${image}" alt="">`,
    );
    await page.locator('img').evaluate((element) => element.decode());
    await page.screenshot({ path: fileURLToPath(new URL(name, directory)), scale: 'css' });
    await page.close();
    console.log(`Rendered ${name} (${size}×${size})`);
  }
} finally {
  await browser.close();
}
