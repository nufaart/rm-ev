# CYBER EV ENGINE - HUD

HUD kecepatan & suara engine untuk motor EV. Berjalan di browser (PWA) dan sebagai aplikasi Android (APK).

## Fitur
- Suara hanya 3 mode: **IDLE**, **CRUISING** (volume naik halus mengikuti kecepatan), dan **ENGINE BRAKE** (hanya saat kecepatan turun ≥ 10 km/jam dalam 3 detik).
- Tombol **CEK UPDATE** untuk mengecek versi terbaru dari repo ini.
- Di Android, engine tetap berjalan di background lewat foreground service.

## Build APK
APK dibuat otomatis oleh GitHub Actions (`.github/workflows/build-apk.yml`):
- Setiap push ke `main`: APK tersedia di tab Actions → artifact `rm-ev-apk`.
- Setiap tag `v*` (contoh `v3.3.0`): APK otomatis diunggah ke GitHub Releases sebagai `rm-ev.apk`.

Build lokal (perlu JDK 21 dan Android SDK):
```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Update versi
Naikkan `version` di `version.json` dan `APP_VERSION` di `index.html`, lalu buat tag `vX.Y.Z`.
