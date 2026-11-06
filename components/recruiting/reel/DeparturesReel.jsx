import React, { useEffect, useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, Easing } from 'remotion';

// Browser-preview copy of make-to-n8n-toolkit src/video/compositions/Departures.jsx (no motion blur, PREVIEW tag,
// short boards padded with blank rows, FILLED beat only when the agency gives a fill time). Keep in step.

// DEPARTURES: weekly hot-jobs roundup as an airport split-flap board (60fps, timings in seconds).
// Macro on flaps rattling into the first role -> pan along its row -> whip to the rest -> wide board ->
// chime + FINAL CALL on one row -> FILLED on another -> whole board flips into the call to action.
// Swap BOARD per agency per week. SFX: scripts/departures_sfx.py -> public/departures/
export const BOARD = {
  agency: 'Northgate Staffing',
  jobs: [
    ['FORKLIFT OPERATOR', 'NEWARK NJ', '$24/HR'], ['WAREHOUSE LEAD', 'EDISON NJ', '$26/HR'], ['CNC MACHINIST', 'PATERSON NJ', '$31/HR'],
    ['CDL-A DRIVER', 'ELIZABETH NJ', '$29/HR'], ['MEDICAL BILLER', 'REMOTE', '$23/HR'], ['HR ASSISTANT', 'CLIFTON NJ', '$22/HR'],
  ],
  finalCall: 1, filled: 5, filledIn: '4 days',
  message: ['', 'APPLY BEFORE', 'IT DEPARTS', '', 'NORTHGATE', 'LINK IN BIO'],
};
export const DEPARTURES_FPS = 60;
export const DEPARTURES_FRAMES = Math.round(14.5 * DEPARTURES_FPS);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = Easing.bezier(0.5, 0, 0.15, 1);
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const UI = 'DpUI, Arial, sans-serif';
const YEL = '#FFD23F';

let fontsAdded = false;
const useFonts = () => {
  useEffect(() => {
    if (fontsAdded) return; fontsAdded = true;
    ['600', '800', '900'].map((w) => new FontFace('DpUI', `url(/jobmap/InterTight-${w}.woff2)`, { weight: w }))
      .forEach((f) => f.load().then((x) => document.fonts.add(x)).catch(() => {}));
  }, []);
};

// board geometry (world px)
const CS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$/-.:'";
const TW = 38, TH = 60, PITCH = 42, CG = 30, RP = 76, X0 = 56, Y0 = 170, NCOL = 45, NROW = 6;
const COLS = [['POSITION', 0, 17], ['LOCATION', 17, 12], ['PAY', 29, 6], ['STATUS', 35, 10]];
const tileX = (i) => X0 + i * PITCH + (i >= 17 ? CG : 0) + (i >= 29 ? CG : 0) + (i >= 35 ? CG : 0);
const LAMPX = tileX(NCOL - 1) + TW + 34, BW = LAMPX + 70, BH = Y0 + NROW * RP + 40;
const rowY = (r) => Y0 + r * RP;
const pad = (s, n) => (s.toUpperCase().split('').map((c) => (CS.includes(c) ? c : ' ')).join('') + ' '.repeat(n)).slice(0, n);
const center = (s, n) => pad(' '.repeat(Math.max(0, Math.floor((n - s.length) / 2))) + s, n);

// camera keyframes: [t, cx, cy, scale, rotateZ]
const statusCx = tileX(40) + 30;
const camFor = (fc, fl) => [[0, 300, rowY(0) + 30, 2.55, -4], [1.5, 430, rowY(0) + 30, 2.35, -3], [2.05, 1020, rowY(0) + 40, 1.45, -1], [2.6, 1200, rowY(0) + 40, 1.4, -1],
  [3.0, statusCx + 20, rowY(0) + 40, 1.7, 1], [3.45, statusCx + 40, rowY(0) + 40, 1.72, 1], [3.85, 620, rowY(2), 1.05, 2], [4.9, 1250, rowY(2), 1.0, 1],
  [5.6, BW / 2, BH / 2, 0.47, 0], [6.75, BW / 2, BH / 2, 0.49, 0], [7.25, statusCx, rowY(fc) + 30, 1.3, -1.5], [8.45, statusCx, rowY(fc) + 30, 1.33, -1.5],
  [8.85, statusCx, rowY(fl) + 30, 1.3, 1], [9.65, statusCx, rowY(fl) + 30, 1.34, 1], [10.25, tileX(8) + 20, rowY(2) + 60, 1.3, 0], [14.5, tileX(8) + 20, rowY(2) + 60, 1.37, 0]];
const camAt = (CAM, t) => { let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++; const a = CAM[i], b = CAM[i + 1], e = ease(seg(t, a[0], b[0])); return [1, 2, 3, 4].map((k) => lerp(a[k], b[k], e)); };

// every tile's change events: [startTime, toChar, secondsPerFlip]; flaps always advance forward through CS
const buildEvents = (b) => {
  const T = Array.from({ length: NROW }, () => Array.from({ length: NCOL }, () => []));
  const rowText = (r, status) => { const j = b.jobs[r]; if (!j) return ' '.repeat(NCOL); return pad(j[0], 17) + pad(j[1], 12) + pad(j[2], 6) + pad(status, 10); };
  for (let r = 0; r < NROW; r++) {
    const s = rowText(r, 'BOARDING');
    for (let c = 0; c < NCOL; c++) T[r][c].push(r === 0 ? [0.05 + c * 0.05, s[c], 0.04] : [2.7 + r * 0.12 + c * 0.022, s[c], 0.035]);
  }
  const restatus = (r, at, st) => { const s = pad(st, 10); for (let c = 35; c < NCOL; c++) T[r][c].push([at + (c - 35) * 0.04, s[c - 35], 0.035]); };
  restatus(b.finalCall, 7.0, 'FINAL CALL');
  if (b.filledIn) restatus(b.filled, 8.75, 'FILLED');
  for (let r = 0; r < NROW; r++) { const m = center(b.message[r] || '', 17) + ' '.repeat(NCOL - 17);
    for (let c = 0; c < NCOL; c++) T[r][c].push([9.95 + r * 0.07 + c * 0.015, m[c], 0.028]); }
  return T;
};

// state of one tile at time t: current char, next char, flip phase (null when at rest)
const tileAt = (ev, t) => {
  let ch = ' ';
  for (const [at, to, d] of ev) {
    if (t < at) break;
    const i0 = CS.indexOf(ch), n = (CS.indexOf(to) - i0 + CS.length) % CS.length, k = (t - at) / d;
    if (k >= n) { ch = to; continue; }
    const f = Math.floor(k);
    return [CS[(i0 + f) % CS.length], CS[(i0 + f + 1) % CS.length], k - f];
  }
  return [ch, ch, null];
};

const Half = ({ ch, color, bottom }) => <div style={{ position: 'absolute', left: 0, top: bottom ? TH / 2 : 0, width: TW, height: TH / 2, overflow: 'hidden',
  background: bottom ? 'linear-gradient(#1c1c1d, #121213)' : 'linear-gradient(#2b2b2d, #1e1e20)', borderRadius: bottom ? '0 0 5px 5px' : '5px 5px 0 0' }}>
  <div style={{ position: 'absolute', left: 0, top: bottom ? -TH / 2 : 0, width: TW, height: TH, font: `800 42px/${TH}px ${UI}`, color, textAlign: 'center', textShadow: `0 0 10px ${color}33` }}>{ch}</div></div>;

const Tile = ({ x, y, st, color }) => {
  const [cur, nxt, p] = st;
  return <div style={{ position: 'absolute', left: x, top: y, width: TW, height: TH, boxShadow: '0 3px 4px rgba(0,0,0,.6)', borderRadius: 5 }}>
    {p == null ? <><Half ch={cur} color={color} /><Half ch={cur} color={color} bottom /></> : <>
      <Half ch={nxt} color={color} />
      <Half ch={cur} color={color} bottom />
      {p < 0.5 ? <div style={{ position: 'absolute', inset: 0, transformOrigin: `50% ${TH / 2}px`, transform: `perspective(240px) rotateX(${-180 * p}deg)` }}>
        <Half ch={cur} color={color} /><div style={{ position: 'absolute', left: 0, top: 0, width: TW, height: TH / 2, background: '#000', opacity: p * 1.2 }} /></div>
        : <div style={{ position: 'absolute', inset: 0, transformOrigin: `50% ${TH / 2}px`, transform: `perspective(240px) rotateX(${180 * (1 - p)}deg)` }}>
          <Half ch={nxt} color={color} bottom /><div style={{ position: 'absolute', left: 0, top: TH / 2, width: TW, height: TH / 2, background: '#000', opacity: (1 - p) * 1.0 }} /></div>}
    </>}
    <div style={{ position: 'absolute', left: 0, right: 0, top: TH / 2 - 1, height: 2, background: '#050505' }} />
  </div>;
};

const Caption = ({ t, at, out, children }) => { if (t < at || t > out + 0.2) return null; const p = expo(seg(t, at, at + 0.3)), o = seg(t, out, out + 0.2);
  return <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', zIndex: 20, opacity: 1 - o }}>
    <span style={{ display: 'inline-block', font: `900 58px ${UI}`, letterSpacing: '-.02em', color: '#111', background: YEL, padding: '18px 34px', borderRadius: 10, boxShadow: '0 14px 40px rgba(0,0,0,.55)',
      transform: `translateY(${(1 - p) * -40}px) scale(${lerp(1.18, 1, p) - 0.08 * o})` }}>{children}</span></div>; };

const Scene = ({ b }) => {
  const t = useCurrentFrame() / DEPARTURES_FPS;
  const ev = useMemo(() => buildEvents(b), [b]);
  const cam = useMemo(() => camFor(b.finalCall, b.filledIn ? b.filled : b.finalCall), [b]);
  const [cx, cy, s, rz] = camAt(cam, t);
  const statusOf = (r) => (t >= 8.75 && b.filledIn && r === b.filled ? 'FILLED' : t >= 7.0 && r === b.finalCall ? 'FINAL' : 'BOARDING');
  const msg = t >= 9.95;
  const colColor = (r, c) => (msg ? '#F4F1E8' : c >= 35 ? ({ FILLED: '#8E98A3', FINAL: '#FFB020', BOARDING: '#5BE38D' })[statusOf(r)] : c >= 29 ? YEL : '#F4F1E8');
  const lamp = (r) => { if (msg || !b.jobs[r] || t < (r === 0 ? 2.2 : 4.4)) return ['#222', 0]; const st = statusOf(r);
    return st === 'FINAL' ? (Math.floor(t * 3) % 2 ? ['#FFB020', 1] : ['#3a2a10', 0]) : st === 'FILLED' ? ['#59626b', 0] : ['#5BE38D', 0.8]; };
  const endIn = expo(seg(t, 11.0, 11.6));
  return <AbsoluteFill style={{ background: '#070a0e', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
      transform: `translate(540px, 960px) rotate(${rz}deg) scale(${s}) translate(${-cx}px, ${-cy}px)` }}>
      {/* terminal: back wall, ceiling light strips, board mounting rods */}
      <div style={{ position: 'absolute', left: -2400, top: -2600, width: BW + 4800, height: 6400, background: 'linear-gradient(#0c1118, #121a24 45%, #0a0e13 60%, #06080b)' }} />
      {[-1500, -1050, -700].map((y, k) => <div key={y} style={{ position: 'absolute', left: -1800 + k * 120, top: y, width: BW + 3600 - k * 240, height: 26 - k * 5, borderRadius: 20,
        background: '#dfe9f5', opacity: 0.12 + k * 0.05, filter: 'blur(8px)', boxShadow: '0 0 80px 30px rgba(190,215,240,.10)' }} />)}
      {[BW * 0.2, BW * 0.8].map((x) => <div key={x} style={{ position: 'absolute', left: x - 9, top: -1600, width: 18, height: 1600, background: 'linear-gradient(90deg,#15181c,#262b31,#121518)' }} />)}
      <div style={{ position: 'absolute', left: BW * 0.1, top: BH + 60, width: BW * 0.8, height: 260, borderRadius: '50%', background: 'radial-gradient(rgba(140,170,200,.10), transparent 70%)' }} />
      {/* housing */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: BW, height: BH, borderRadius: 18, background: 'linear-gradient(#17191c, #0e0f11)', border: '3px solid #2b2f35',
        boxShadow: '0 50px 120px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.06)' }} />
      <div style={{ position: 'absolute', left: X0, top: 34, font: `900 58px/1 ${UI}`, color: YEL, letterSpacing: '.04em' }}>DEPARTURES</div>
      <div style={{ position: 'absolute', left: X0 + 410, top: 52, font: `600 24px/1 ${UI}`, color: '#8b95a1', letterSpacing: '.18em', whiteSpace: 'nowrap' }}>JOBS LEAVING THIS WEEK</div>
      <div style={{ position: 'absolute', right: BW - LAMPX - 40, top: 30, font: `800 58px/1 ${UI}`, color: '#F4F1E8', fontVariantNumeric: 'tabular-nums' }}>08:4{Math.min(9, 7 + Math.floor(t / 6))}</div>
      {COLS.map(([l, c0]) => <div key={l} style={{ position: 'absolute', left: tileX(c0), top: 124, font: `800 22px/1 ${UI}`, color: '#6f7a86', letterSpacing: '.2em' }}>{l}</div>)}
      {ev.map((row, r) => <React.Fragment key={r}>
        {row.map((e, c) => <Tile key={c} x={tileX(c)} y={rowY(r)} st={tileAt(e, t)} color={colColor(r, c)} />)}
        {(() => { const [col, g] = lamp(r); return <div style={{ position: 'absolute', left: LAMPX, top: rowY(r) + TH / 2 - 11, width: 22, height: 22, borderRadius: 11, background: col,
          boxShadow: g ? `0 0 ${18 * g}px ${6 * g}px ${col}88` : 'inset 0 2px 3px rgba(0,0,0,.6)' }} />; })()}
      </React.Fragment>)}
    </div>
    {/* lens: vignette + faint top light */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)' }} />
    <Caption t={t} at={0.3} out={1.85}>{b.jobs.length} jobs leaving this week.</Caption>
    <Caption t={t} at={7.3} out={8.45}>Final call.</Caption>
    {b.filledIn && <Caption t={t} at={8.95} out={9.7}>This one filled in {b.filledIn}.</Caption>}
    {t >= 11.0 && <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: endIn, transform: `translateY(${(1 - endIn) * -50}px)` }}>
        <div style={{ font: `900 86px/1 ${UI}`, color: '#fff', letterSpacing: '-.035em' }}>Don't miss</div>
        <div style={{ font: `900 86px/1.05 ${UI}`, color: YEL, letterSpacing: '-.035em' }}>your flight.</div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', display: 'grid', gap: 16, opacity: expo(seg(t, 11.5, 12.0)), transform: `translateY(${(1 - expo(seg(t, 11.5, 12.0))) * 40}px)` }}>
        <div style={{ font: `800 50px/1 ${UI}`, color: '#fff' }}>{b.agency}</div>
        <div style={{ font: `600 32px/1 ${UI}`, color: '#9aa4af' }}>{b.jobs.length} roles open · apply at the link in bio</div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', font: `600 22px/1 ${UI}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', opacity: endIn }}>{b.preview ? 'PREVIEW · MADE ON MONTERO.COOL' : 'SAMPLE REEL · FICTIONAL AGENCY'}</div>
    </>}
  </AbsoluteFill>;
};

export const Departures = (props) => {
  useFonts();
  const b = useMemo(() => ({ ...BOARD, ...props }), [props]), F = (x) => Math.round(x * DEPARTURES_FPS);
  const sfx = [['room', 0, 0.5], ['clatter_long', 0.05, 0.85], ['whoosh', 1.85, 0.35], ['clatter_mid', 2.7, 0.65], ['whoosh', 3.55, 0.5], ['whoosh', 5.15, 0.4],
    ['chime', 6.55, 0.7], ['clatter_short', 7.0, 0.8], ['whoosh', 8.5, 0.3], ['clatter_short', 8.75, 0.8], ['whoosh', 9.8, 0.45], ['clatter_big', 9.95, 0.9], ['chime', 11.1, 0.45]];
  return <AbsoluteFill>
    <Scene b={b} />
    {sfx.map(([n, at, v], k) => <Sequence key={k} from={F(at)} durationInFrames={F(n === 'room' ? 14.5 : 2.5)}><Audio src={`/reels/dp_${n}.wav`} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
