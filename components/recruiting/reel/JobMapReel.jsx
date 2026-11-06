import React, { useEffect, useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, Easing } from 'remotion';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import us from 'us-atlas/states-10m.json';

// JOB MAP for the in-browser preview on /recruiting. Copy of make-to-n8n-toolkit src/video/compositions/JobMap.jsx
// (the HD render), minus camera motion blur (too heavy live) and with a PREVIEW tag. Keep the two in step.
// Fonts + SFX: public/jobmap/
export const MAP = {
  agency: 'Your Agency', site: 'youragency.com', brand: '#1E4BFF', states: ['New Jersey', 'New York'],
  jobs: [
    { role: 'Forklift Operator', city: 'Newark', st: 'NJ', lon: -74.172, lat: 40.735, pay: '$24/hr', type: 'Full-time' },
    { role: 'Warehouse Lead', city: 'Albany', st: 'NY', lon: -73.756, lat: 42.652, pay: '$26/hr', type: '1st shift' },
    { role: 'CNC Machinist', city: 'Buffalo', st: 'NY', lon: -78.878, lat: 42.886, pay: '$31/hr', type: 'Full-time' },
    { role: 'Medical Biller', city: 'Trenton', st: 'NJ', lon: -74.763, lat: 40.221, pay: '$23/hr', type: 'Hybrid' },
  ],
  sample: true,
};
export const JOBMAP_FPS = 60;
const J0 = 2.15, JD = 1.75; // first job beat, seconds per job
export const jobMapSeconds = (n) => J0 + n * JD + 4.6;
export const JOBMAP_FRAMES = Math.round(jobMapSeconds(MAP.jobs.length) * JOBMAP_FPS);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = Easing.bezier(0.6, 0, 0.15, 1);
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const back = Easing.bezier(0.3, 1.6, 0.5, 1);
const UI = 'JmUI, Arial, sans-serif';
const NAVY = '#0C1A3A', INK2 = '#5B6782', BG = '#EEF1F6', LAND = '#D9DFEA', PAY = '#FFD23F';

let fontsAdded = false;
const useFonts = () => {
  useEffect(() => {
    if (fontsAdded) return; fontsAdded = true;
    ['600', '800', '900'].map((w) => new FontFace('JmUI', `url(/jobmap/InterTight-${w}.woff2)`, { weight: w }))
      .forEach((f) => f.load().then((x) => document.fonts.add(x)).catch(() => {}));
  }, []);
};

const proj = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const gp = geoPath(proj);
const STATES = feature(us, us.objects.states).features.map((f) => ({ name: f.properties.name, d: gp(f), b: gp.bounds(f), c: gp.centroid(f) })).filter((s) => s.d);

// camera: [t, cx, cy, scale, anchorY]; anchorY = where the camera centre sits on screen
const buildCam = (m, pts, active) => {
  const bx = active.reduce((a, s) => [Math.min(a[0], s.b[0][0]), Math.min(a[1], s.b[0][1]), Math.max(a[2], s.b[1][0]), Math.max(a[3], s.b[1][1])], [1e9, 1e9, -1e9, -1e9]);
  const fit = Math.min(900 / (bx[2] - bx[0]), 760 / (bx[3] - bx[1])), mx = (bx[0] + bx[2]) / 2, my = (bx[1] + bx[3]) / 2;
  const c = [[0, 487.5, 305, 1.04, 1080], [1.2, 487.5, 305, 1.1, 1080], [J0 - 0.15, mx, my, fit, 820]];
  pts.forEach((p, i) => { const a = J0 + i * JD; c.push([a + 0.5, p[0], p[1], fit * 1.9, 720], [a + JD - 0.05, p[0], p[1], fit * 2.0, 720]); });
  const e = J0 + pts.length * JD;
  c.push([e + 0.55, mx, my, fit * 0.95, 780], [e + 5, mx, my, fit * 1.0, 780]);
  return { cam: c, fit, end: e };
};
const camAt = (cam, t) => { let i = 0; while (i < cam.length - 2 && t >= cam[i + 1][0]) i++; const a = cam[i], b = cam[i + 1], e = ease(seg(t, a[0], b[0])); return [1, 2, 3, 4].map((k) => lerp(a[k], b[k], e)); };

const Words = ({ text, t, at, style, step = 0.07 }) => <span style={{ display: 'inline-block', ...style }}>{text.split(' ').map((w, k) => {
  const p = expo(seg(t, at + k * step, at + k * step + 0.45));
  return <span key={k} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginRight: '0.24em' }}>
    <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)` }}>{w}</span></span>; })}</span>;

const PinIcon = ({ c, size = 34 }) => <svg width={size} height={size} viewBox="0 0 24 24" style={{ verticalAlign: '-0.12em', marginRight: 10 }}>
  <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill={c} /><circle cx={12} cy={10} r={2.8} fill="#fff" /></svg>;

const Card = ({ j, i, n, t, at, brand }) => {
  const p = expo(seg(t, at + 0.42, at + 0.95)), out = ease(seg(t, at + JD - 0.22, at + JD + 0.12)), chip = (k) => back(seg(t, at + 0.7 + k * 0.1, at + 1.05 + k * 0.1));
  if (t < at + 0.42 || out >= 1) return null;
  return <div style={{ position: 'absolute', left: 70, right: 70, top: 1130, background: '#fff', borderRadius: 34, padding: '44px 52px 50px', boxShadow: '0 30px 80px rgba(12,26,58,.18), 0 2px 0 rgba(12,26,58,.04)',
    transform: `translate(${-out * 1150}px, ${(1 - p) * 90}px) rotate(${-out * 6}deg) scale(${lerp(0.94, 1, p)})`, opacity: p }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', font: `800 26px/1 ${UI}`, letterSpacing: '.16em', color: brand }}><span>NOW HIRING</span><span style={{ color: INK2, fontVariantNumeric: 'tabular-nums' }}>{i + 1} / {n}</span></div>
    <div style={{ marginTop: 26, font: `900 84px/1 ${UI}`, letterSpacing: '-.035em', color: NAVY }}><Words text={j.role} t={t} at={at + 0.5} /></div>
    <div style={{ marginTop: 22, font: `600 42px/1 ${UI}`, color: INK2, opacity: seg(t, at + 0.65, at + 0.85) }}><PinIcon c={brand} />{j.city}, {j.st}</div>
    <div style={{ display: 'flex', gap: 18, marginTop: 34 }}>
      <div style={{ font: `900 52px/1 ${UI}`, color: NAVY, background: PAY, padding: '18px 28px', borderRadius: 18, transform: `scale(${chip(0)})` }}>{j.pay}</div>
      <div style={{ font: `800 40px/1 ${UI}`, color: NAVY, border: `4px solid ${NAVY}`, padding: '19px 26px', borderRadius: 18, transform: `scale(${chip(1)})` }}>{j.type}</div>
    </div>
  </div>;
};

const Scene = ({ m }) => {
  const t = useCurrentFrame() / JOBMAP_FPS;
  const { pts, active, cam, end } = useMemo(() => {
    const pts = m.jobs.map((j) => proj([j.lon, j.lat])), active = STATES.filter((s) => m.states.includes(s.name));
    return { pts, active, ...buildCam(m, pts, active) };
  }, [m]);
  const [cx, cy, s, ay] = camAt(cam, t);
  const toS = (p) => [540 + (p[0] - cx) * s, ay + (p[1] - cy) * s];
  const n = m.jobs.length, b = m.brand;
  const fill = (k) => expo(seg(t, 0.55 + k * 0.18, 0.95 + k * 0.18));
  const head = ease(seg(t, J0 - 0.6, J0)); // hook title -> compact header
  const wipe = ease(seg(t, end + 0.95, end + 1.6)), last = toS(pts[n - 1] || [487, 305]);
  return <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
    {/* map */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: 975, height: 610, transformOrigin: '0 0', transform: `translate(540px, ${ay}px) scale(${s}) translate(${-cx}px, ${-cy}px)` }}>
      <svg width={975} height={610} style={{ overflow: 'visible' }}>
        {STATES.map((st) => { const k = m.states.indexOf(st.name);
          return <path key={st.name} d={st.d} fill={k < 0 ? LAND : b} fillOpacity={k < 0 ? 1 : 0.15 + 0.75 * fill(k)} stroke="#fff" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />; })}
      </svg>
    </div>
    {/* state labels on the zoomed map */}
    {active.map((st) => { const [x, y] = toS(st.c), o = seg(t, J0 - 0.4, J0) * (1 - seg(t, end + 0.9, end + 1.1));
      return <div key={st.name} style={{ position: 'absolute', left: x - 300, top: y - 20, width: 600, textAlign: 'center', font: `800 30px/1 ${UI}`, letterSpacing: '.3em', color: '#fff', opacity: o * 0.85, textShadow: `0 2px 10px ${b}` }}>{st.name.toUpperCase()}</div>; })}
    {/* route between pins, drawn as the camera travels */}
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {pts.slice(1).map((p, i) => { const a = toS(pts[i]), z = toS(p), q = ease(seg(t, J0 + (i + 1) * JD, J0 + (i + 1) * JD + 0.5));
        return q > 0 && <line key={i} x1={a[0]} y1={a[1]} x2={lerp(a[0], z[0], q)} y2={lerp(a[1], z[1], q)} stroke={b} strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />; })}
    </svg>
    {/* pins */}
    {pts.map((p, i) => { const at = J0 + i * JD + 0.35; if (t < at) return null; const [x, y] = toS(p), d = back(seg(t, at, at + 0.4)), r = seg(t, at + 0.2, at + 1.1), live = t < at + JD - 0.3;
      return <React.Fragment key={i}>
        <div style={{ position: 'absolute', left: x - 70 * r, top: y - 70 * r, width: 140 * r, height: 140 * r, borderRadius: '50%', border: `4px solid ${b}`, opacity: (1 - r) * 0.8 }} />
        <div style={{ position: 'absolute', left: x - 21, top: y - 21 - (1 - d) * 160, width: 42, height: 42, borderRadius: '50%', background: b, border: '7px solid #fff', boxShadow: '0 8px 18px rgba(12,26,58,.3)', transform: `scale(${live ? 1.15 : 0.8})` }} />
        {live && t > at + 0.4 && <div style={{ position: 'absolute', left: x - 2, top: y + 26, width: 4, height: Math.max(0, 1130 - y - 26) * expo(seg(t, at + 0.05, at + 0.45)), background: `linear-gradient(${b}, ${b}00)` }} />}
      </React.Fragment>; })}
    {/* hook title -> compact header */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300, background: `linear-gradient(${BG} 62%, ${BG}00)`, opacity: head }} />
    <div style={{ position: 'absolute', left: 70, right: 70, top: lerp(250, 120, head) }}>
      <div style={{ font: `900 ${lerp(132, 0.001, head)}px/0.95 ${UI}`, letterSpacing: '-.045em', color: NAVY, opacity: 1 - head, height: lerp(128, 0, head) }}><Words text="Now hiring" t={t} at={0.08} /></div>
      <div style={{ marginTop: lerp(14, 0, head), font: `900 ${lerp(70, 40, head)}px/1.05 ${UI}`, letterSpacing: '-.03em', color: b }}>
        <Words text={`in ${m.states.length > 2 ? m.states.slice(0, -1).join(', ') + ' & ' + m.states.at(-1) : m.states.join(' & ')}`} t={t} at={0.3} /></div>
      <div style={{ marginTop: 10, font: `800 34px/1 ${UI}`, color: INK2, opacity: head }}>{m.agency} · {n} open roles</div>
    </div>
    {m.jobs.map((j, i) => <Card key={i} j={j} i={i} n={n} t={t} at={J0 + i * JD} brand={b} />)}
    {/* all pins recap */}
    {t > end && t < end + 1.2 && <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', font: `900 92px/1 ${UI}`, letterSpacing: '-.04em', color: NAVY, opacity: seg(t, end + 0.25, end + 0.45) }}>
      <Words text={`${n} roles. Apply today.`} t={t} at={end + 0.2} /></div>}
    {/* end card: circle wipe out of the last pin */}
    {wipe > 0 && <AbsoluteFill style={{ background: b, clipPath: `circle(${wipe * 2300}px at ${last[0]}px ${last[1]}px)` }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 560, color: '#fff' }}>
        <div style={{ font: `800 34px/1 ${UI}`, letterSpacing: '.2em', opacity: 0.75 }}>{n} OPEN ROLES · {m.jobs.map((j) => j.st).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</div>
        <div style={{ marginTop: 26, font: `900 128px/0.95 ${UI}`, letterSpacing: '-.045em' }}><Words text={m.agency} t={t} at={end + 1.3} /></div>
        <div style={{ marginTop: 60, display: 'inline-block', background: '#fff', color: NAVY, font: `900 54px/1 ${UI}`, padding: '30px 46px', borderRadius: 999,
          transform: `scale(${back(seg(t, end + 1.75, end + 2.1)) * (1 - 0.06 * Math.sin(Math.PI * seg(t, end + 2.7, end + 2.95)))})` }}>Apply in 60 seconds</div>
        <div style={{ marginTop: 40, font: `600 44px/1 ${UI}`, opacity: seg(t, end + 2.1, end + 2.4) }}>{m.site}</div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 1240, display: 'grid', gap: 0, color: '#fff' }}>
        {m.jobs.map((j, i) => { const q = expo(seg(t, end + 2.3 + i * 0.09, end + 2.75 + i * 0.09));
          return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '22px 0', borderTop: '2px solid rgba(255,255,255,.25)', opacity: q, transform: `translateY(${(1 - q) * 30}px)` }}>
            <span style={{ font: `800 40px/1 ${UI}` }}>{j.role}<span style={{ font: `600 30px/1 ${UI}`, opacity: 0.7, marginLeft: 16 }}>{j.city}, {j.st}</span></span>
            <span style={{ font: `900 40px/1 ${UI}`, color: PAY, fontVariantNumeric: 'tabular-nums' }}>{j.pay}</span></div>; })}
      </div>
      {m.preview && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', font: `600 22px/1 ${UI}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.55)' }}>PREVIEW · MADE ON MONTERO.COOL</div>}
      {m.sample && !m.preview && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', font: `600 22px/1 ${UI}`, letterSpacing: '.16em', color: 'rgba(255,255,255,.55)' }}>SAMPLE REEL · FICTIONAL AGENCY + JOBS</div>}
    </AbsoluteFill>}
  </AbsoluteFill>;
};

export const JobMap = (props) => {
  useFonts();
  const m = useMemo(() => ({ ...MAP, ...props }), [props]), F = (x) => Math.round(x * JOBMAP_FPS), n = m.jobs.length, e = J0 + n * JD;
  const sfx = [['tick', 0.08, 0.5], ['tick', 0.3, 0.5], ['pop', 0.6, 0.4], ['pop', 0.78, 0.4], ['whoosh', J0 - 0.75, 0.5],
    ...m.jobs.flatMap((_, i) => [['whoosh', J0 + i * JD - 0.05, i ? 0.35 : 0], ['pop', J0 + i * JD + 0.5, 0.8], ['tick', J0 + i * JD + 0.72, 0.5], ['tick', J0 + i * JD + 0.82, 0.5]]),
    ['whoosh', e, 0.4], ['swell', e + 0.2, 0.6], ['chord', e + 1.0, 0.6], ['pop', e + 1.8, 0.6]];
  return <AbsoluteFill>
    <Scene m={m} />
    {sfx.filter((x) => x[2] > 0).map(([s, at, v], k) => <Sequence key={k} from={F(at)} durationInFrames={F({ chord: 3.6, swell: 2 }[s] || 1.2)}><Audio src={`/jobmap/sfx_${s}.wav`} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
