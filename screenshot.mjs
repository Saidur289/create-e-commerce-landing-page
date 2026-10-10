import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';

const [, , htmlPath, outPath, width = '1440'] = process.argv;
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: Number(width), height: 900, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 1500));
// freeze animations so the screenshot is deterministic
await page.addStyleTag({ content: '*{animation:none!important;opacity:1}' });
await page.screenshot({ path: outPath, fullPage: true });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log('saved', outPath, 'horizontal overflow:', overflow);
await browser.close();
