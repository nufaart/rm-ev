// Menyalin aset web (index.html, version.json) ke folder www/ yang dibaca Capacitor.
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';

mkdirSync('www', { recursive: true });
for (const f of ['index.html', 'version.json']) {
  if (existsSync(f)) copyFileSync(f, `www/${f}`);
}
console.log('www/ siap');
