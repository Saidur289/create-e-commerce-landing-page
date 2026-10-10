import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';

const [, , htmlPath, outDir, width = '1280'] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.setViewport({ width: Number(width), height: 800 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'domcontentloaded' });
await sleep(900);
await page.screenshot({ path: `${outDir}/intro-mid.png` });
await sleep(3000);
await page.screenshot({ path: `${outDir}/intro-done.png` });

const info = await page.evaluate(() => ({
  gsap: !!window.gsap, st: !!window.ScrollTrigger, lenis: document.documentElement.classList.contains('lenis'),
  icons: document.querySelectorAll('svg.lucide').length, leftoverI: document.querySelectorAll('i[data-lucide]').length,
}));
// scroll through so every ScrollTrigger fires, grabbing one frame mid-reveal
const h = await page.evaluate(() => document.documentElement.scrollHeight);
let shotTaken = false;
for (let y = 0; y < h; y += 300) {
  await page.evaluate(y => window.scrollTo(0, y), y);
  await sleep(250);
  if (!shotTaken && y >= 1100) { await sleep(150); await page.screenshot({ path: `${outDir}/scroll-mid.png` }); shotTaken = true; }
}
await sleep(3000);
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(1500);
const hidden = await page.evaluate(() => [...document.querySelectorAll('.pre, .cat-img, .product-img')]
  .filter(el => getComputedStyle(el).opacity < 0.99 || getComputedStyle(el).visibility === 'hidden').length);
await page.screenshot({ path: `${outDir}/final-full.png`, fullPage: true });
console.log(JSON.stringify({ ...info, stillHidden: hidden, errors }, null, 1));
await browser.close();
