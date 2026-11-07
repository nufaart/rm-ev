// Merekam app ASLI (index.html) di Chrome: START ENGINE, simulasi kecepatan, drawer.
// Output: video/capture/out/*.webm + screenshot di ../docs/media/
import { chromium } from 'playwright-core';
import { mkdirSync, renameSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const appUrl = pathToFileURL(path.resolve(here, '../../index.html')).href;
const outDir = path.join(here, 'out');
const mediaDir = path.resolve(here, '../../docs/media');
mkdirSync(outDir, { recursive: true });
mkdirSync(mediaDir, { recursive: true });

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
             'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);

const browser = await chromium.launch({
  executablePath: exe,
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: outDir, size: { width: 780, height: 1688 } },
});
const page = await context.newPage();
await page.goto(appUrl);
await page.waitForTimeout(1500);
const shot = (name) => page.screenshot({ path: path.join(mediaDir, name) });

const sleep = (ms) => page.waitForTimeout(ms);
const setSpeed = (v) => page.evaluate((val) => {
  const s = document.getElementById('manualSlider');
  s.value = String(val);
  s.dispatchEvent(new Event('input'));
}, v);
async function ramp(from, to, ms) {
  const steps = Math.max(1, Math.round(ms / 100));
  for (let i = 1; i <= steps; i++) {
    await setSpeed(from + ((to - from) * i) / steps);
    await sleep(100);
  }
}

// 1) Idle, lalu START ENGINE
await sleep(1200);
await page.click('#btnEngine');
await sleep(800);
// 2) Aktifkan simulasi (dari drawer, dibuka sebentar)
await page.evaluate(() => document.getElementById('btnTestMode').click());
// 3) Cruising naik pelan ke klaster 30-45
await ramp(0, 36, 6000);
await sleep(1500);
await shot('screen-cruise.png');
// 4) Naik di atas 40 km/jam -> suara akselerasi
await ramp(36, 78, 5000);
await sleep(1200);
await shot('screen-accel.png');
// 5) Turun kecepatan besar dan lama -> engine brake
await ramp(78, 34, 3200);
await sleep(1400);
await shot('screen-brake.png');
// 6) Pelan ke klaster 10-30 lalu buka drawer
await ramp(34, 22, 2000);
await sleep(600);
await page.click('#btnDrawer');
await sleep(1400);
await page.evaluate(() => document.querySelector('.mode-btn[data-mode="accel"]').click());
await sleep(700);
await page.evaluate(() => {
  const sel = document.getElementById('exhaustPreset');
  sel.value = 'crossplane';
  sel.dispatchEvent(new Event('change'));
});
await sleep(900);
await page.screenshot({ path: path.join(mediaDir, 'screen-drawer.png') });
await sleep(900);
await page.click('#btnClose');
await sleep(700);
await ramp(22, 0, 1500);
await sleep(800);

const video = page.video();
await page.close();
const vpath = await video.path();
await context.close();
await browser.close();
const dest = path.join(outDir, 'app-recording.webm');
renameSync(vpath, dest);
console.log('recorded:', dest);
