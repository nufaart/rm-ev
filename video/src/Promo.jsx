// Promo vertikal 1080x1920: rekaman APP ASLI (public/app-recording.webm) di dalam bingkai HP,
// dengan caption yang disinkronkan ke tahap-tahap rekaman.
import {
  AbsoluteFill, Sequence, OffthreadVideo, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from 'remotion';
import { loadFont as loadOrbitron } from '@remotion/google-fonts/Orbitron';
import { loadFont as loadRajdhani } from '@remotion/google-fonts/Rajdhani';

const { fontFamily: orbitron } = loadOrbitron('normal', { weights: ['600', '800'], subsets: ['latin'] });
const { fontFamily: rajdhani } = loadRajdhani('normal', { weights: ['500', '700'], subsets: ['latin'] });

const C = { bg: '#04060c', cyan: '#22e3ff', magenta: '#ff3d8b', lime: '#a6ff4d', ink: '#e8f7ff', muted: '#6f7f9e' };
const FPS = 30;
const sec = (s) => Math.round(s * FPS);

// Tahap caption (detik) — mengikuti urutan di video/capture/capture.mjs
const SCENES = [
  { from: 0, to: 3, kicker: 'CYBER EV ENGINE', title: 'HUD kecepatan & suara engine', sub: 'Untuk motor EV kamu' },
  { from: 3, to: 10.5, kicker: '01 · CRUISING', title: 'Suara stabil per klaster', sub: 'Nada tetap di 10–30, 30–45, 45–60, 60–80 km/jam' },
  { from: 10.5, to: 17, kicker: '02 · AKSELERASI', title: 'Di atas 40 km/jam', sub: 'Suara berubah otomatis ke akselerasi' },
  { from: 17, to: 23, kicker: '03 · ENGINE BRAKE', title: 'Turun kecepatan besar', sub: 'Hanya saat turun ≥ 10 km/jam dan lebih dari 1,5 detik' },
  { from: 23, to: 31, kicker: '04 · KONTROL', title: 'Pilih jenis motor', sub: 'Karakter knalpot dan mode suara dari drawer' },
];

const Caption = ({ scene, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const out = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: inP * out, transform: `translateY(${(1 - inP) * 24}px)`, textAlign: 'center' }}>
      <div style={{ fontFamily: orbitron, fontWeight: 600, fontSize: 30, letterSpacing: 8, color: C.cyan }}>{scene.kicker}</div>
      <div style={{ fontFamily: orbitron, fontWeight: 800, fontSize: 70, lineHeight: 1.08, marginTop: 18, color: C.ink, textShadow: `0 0 30px rgba(34,227,255,.35)` }}>{scene.title}</div>
      <div style={{ fontFamily: rajdhani, fontWeight: 500, fontSize: 38, marginTop: 22, color: C.muted }}>{scene.sub}</div>
    </div>
  );
};

const Grid = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.6) % 64;
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(34,227,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,227,255,.05) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        backgroundPosition: `0 ${shift}px`,
      }}
    />
  );
};

const Phone = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  // Rekaman Playwright berukuran 780x1688 px dan app (390x844) berada di pojok kiri-atas.
  // Video diskalakan 2x lalu dipotong ke area app saja.
  const W = 560;
  const H = Math.round(W * (844 / 390));
  return (
    <div style={{ position: 'absolute', left: (1080 - W - 40) / 2, top: 620, width: W + 40, height: H + 40, transform: `translateY(${(1 - enter) * 120}px) scale(${0.94 + 0.06 * enter})`, opacity: enter }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 74, padding: 20,
        background: 'linear-gradient(160deg, #1b2740, #070b15 60%, #1b2740)',
        border: '1px solid rgba(34,227,255,.5)',
        boxShadow: '0 0 60px rgba(34,227,255,.25), inset 0 0 0 2px rgba(255,255,255,.04)',
      }}>
        <div style={{ position: 'relative', width: W, height: H, borderRadius: 56, overflow: 'hidden', background: C.bg }}>
          <OffthreadVideo
            src={staticFile('app-recording.webm')}
            muted
            style={{ position: 'absolute', left: 0, top: 0, width: W * 2, height: H * 2 }}
          />
        </div>
      </div>
    </div>
  );
};

export const PROMO_FRAMES = sec(36);

export const Promo = () => {
  const frame = useCurrentFrame();
  const outro = frame >= sec(31);
  const outroIn = interpolate(frame, [sec(31), sec(32)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(34,227,255,.22), transparent 70%), radial-gradient(ellipse 60% 40% at 100% 110%, rgba(255,61,139,.14), transparent 70%)' }} />
      <Grid />

      {/* judul / caption */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 170 }}>
        {SCENES.map((s, i) => (
          <Sequence key={i} from={sec(s.from)} durationInFrames={sec(s.to - s.from)} layout="none">
            <Caption scene={s} durationFrames={sec(s.to - s.from)} />
          </Sequence>
        ))}
      </div>

      <Phone />

      {/* outro */}
      {outro && (
        <AbsoluteFill style={{ background: 'rgba(4,6,12,.82)', opacity: outroIn, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 80 }}>
          <div style={{ fontFamily: orbitron, fontWeight: 800, fontSize: 84, lineHeight: 1.05, textShadow: '0 0 30px rgba(34,227,255,.4)' }}>CYBER EV<br />ENGINE</div>
          <div style={{ fontFamily: rajdhani, fontWeight: 500, fontSize: 42, color: C.muted, marginTop: 30 }}>Unduh APK Android gratis</div>
          <div style={{ marginTop: 56, padding: '28px 56px', borderRadius: '44px 14px 44px 14px', border: `2px solid ${C.cyan}`, fontFamily: orbitron, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: C.bg, background: `linear-gradient(120deg, ${C.cyan}, #7af3ff)`, boxShadow: '0 0 40px rgba(34,227,255,.5)' }}>UNDUH APK</div>
          <div style={{ fontFamily: rajdhani, fontWeight: 700, fontSize: 34, color: C.cyan, marginTop: 36 }}>nufaart.github.io/rm-ev</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
