import React, { useEffect } from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, Easing, random } from 'remotion';

// Browser-preview copy of make-to-n8n-toolkit src/video/compositions/JobDropV3.jsx (no motion blur, PREVIEW tag,
// pay as a ready string, no invented openings/start/perks: the builder passes what the agency gave). Keep in step.
const JOB = { agency: 'Your Agency', role: 'Forklift Operator', town: 'Newark, NJ', pay: '$24/hr', shift: 'Full-time', perks: ['Hiring now', 'Full-time', 'Apply in 60 seconds'],
  status: 'Hiring now', brand: '#1E3FFF', pop: '#FFD23F' };

// JOB DROP v3 (60fps): one continuous morph chain like Kreatively DclkKscsRbs.
// hook words whip in -> highlight sweep -> words collapse into a glowing pill = search bar -> click -> circle wipe to light
// -> decoded headline -> 3D card stack whips in, fans, perks pop -> stack collapses into an app tile -> tile becomes "+" -> "+ Apply"
// -> click -> Applied -> confirmation panel -> defocus to dark end card. All timings in seconds.
export const JOBDROP3_FPS = 60;
export const JOBDROP3_FRAMES = Math.round(12.6 * JOBDROP3_FPS);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const spring = Easing.bezier(0.25, 1.35, 0.4, 1);
const inn = Easing.bezier(0.7, 0, 0.9, 0.5);
const UI = 'J3UI, Arial, sans-serif', MONO = 'J3Mono, monospace';

let fontsAdded = false;
const useFonts = () => {
  useEffect(() => {
    if (fontsAdded) return; fontsAdded = true;
    [['J3UI', 'InterTight-500', '500'], ['J3UI', 'InterTight-600', '600'], ['J3UI', 'InterTight-800', '800'], ['J3UI', 'InterTight-900', '900'], ['J3Mono', 'JetBrainsMono-400', '400']]
      .map(([n, u, w]) => new FontFace(n, `url(/jobmap/${u}.woff2)`, { weight: w })).forEach((f) => f.load().then((x) => document.fonts.add(x)).catch(() => {}));
  }, []);
};

// word slams in sideways; the camera motion blur turns the travel into a streak
const Whip = ({ t, at, dir = 1, children, w = 800, size = 96, color = '#fff', glow }) => {
  const p = seg(t, at, at + 0.34), e = expo(p);
  return <span style={{ display: 'inline-block', margin: '0 .12em', font: `${w} ${size}px/1.06 ${UI}`, letterSpacing: '-.035em', color, opacity: clamp(p * 4, 0, 1),
    transform: `translateX(${dir * 380 * (1 - e)}px) skewX(${-dir * 14 * (1 - e)}deg) scale(${1.15 - 0.15 * e})`, textShadow: glow ? `0 0 44px ${glow}` : 'none' }}>{children}</span>;
};
// letters scatter into place
const Letters = ({ t, at, text, size = 66, w = 800, color = '#0d0f1a', stagger = 0.022 }) => <span style={{ display: 'inline-block', whiteSpace: 'pre' }}>
  {[...text].map((c, i) => { const p = seg(t, at + i * stagger, at + i * stagger + 0.3), e = spring(p), r = random(`l${text}${i}`) - 0.5;
    return <span key={i} style={{ display: 'inline-block', font: `${w} ${size}px/1.1 ${UI}`, letterSpacing: '-.03em', color, opacity: clamp(p * 3, 0, 1),
      transform: `translateY(${(1 - e) * (40 + r * 60)}px) rotate(${(1 - e) * r * 40}deg) scale(${0.5 + 0.5 * e})`, filter: `blur(${(1 - expo(p)) * 8}px)` }}>{c}</span>; })}</span>;
// characters cycle through noise, then lock in left to right
const Decode = ({ t, at, dur = 0.45, text, size = 66, w = 800, color = '#0d0f1a', accent }) => {
  if (t < at) return null; const G = 'ABCDEFGHJKMNPQRSTUVWXYZ0123456789';
  return <span style={{ display: 'inline-block', whiteSpace: 'pre' }}>{[...text].map((c, i) => { const lock = at + dur * (i / text.length) + 0.08, done = t >= lock || c === ' ';
    const g = G[Math.floor(random(`d${i}${Math.floor(t * 24)}`) * G.length)];
    return <span key={i} style={{ display: 'inline-block', font: `${w} ${size}px/1.1 ${UI}`, letterSpacing: '-.03em', color: done ? color : accent, background: done ? 'transparent' : `${accent}22`, borderRadius: 4 }}>{done ? c : g}</span>; })}</span>;
};

const Cursor = ({ x, y, press = 0 }) => <svg width={64} height={64} viewBox="0 0 32 32" style={{ position: 'absolute', left: x - 6, top: y - 4, transform: `scale(${1 - 0.16 * press})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))', zIndex: 30 }}>
  <path d="M6 4 L6 26 L12 20.5 L16 29 L19.5 27.5 L15.6 19.2 L23 19 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" /></svg>;
const Ripple = ({ t, at, x, y, color }) => { const p = seg(t, at, at + 0.35); if (t < at || p >= 1) return null;
  return <div style={{ position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: 40, border: `4px solid ${color}`, transform: `scale(${1 + expo(p) * 2.2})`, opacity: 1 - p, zIndex: 29 }} />; };
const Check = ({ p, size, color = '#fff', stroke = 6 }) => <svg width={size} height={size} viewBox="0 0 64 64"><path d="M17 33 L28 44 L47 22" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={46} strokeDashoffset={46 * (1 - p)} /></svg>;
const route = (t, pts) => { let i = 0; while (i < pts.length - 2 && t >= pts[i + 1][0]) i++; const a = pts[i], b = pts[i + 1], e = ease(seg(t, a[0], b[0])); return [lerp(a[1], b[1], e), lerp(a[2], b[2], e)]; };
const glass = (a = 0.6) => ({ background: `rgba(255,255,255,${a})`, backdropFilter: 'blur(24px)', border: '1.5px solid rgba(255,255,255,.9)', boxShadow: '0 30px 80px rgba(40,60,120,.18), inset 0 1px 0 #fff' });

const JobCard = ({ j }) => <div style={{ width: 640, height: 520, boxSizing: 'border-box', borderRadius: 44, padding: 52, display: 'grid', alignContent: 'start', gap: 26, ...glass(0.8) }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 58, height: 58, borderRadius: 16, background: `linear-gradient(140deg, ${j.brand}, #6B8BFF)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `900 30px ${UI}` }}>{j.agency[0]}</div>
    <div style={{ display: 'grid' }}><span style={{ font: `800 26px ${UI}`, color: '#141622' }}>{j.agency}</span><span style={{ font: `500 22px ${UI}`, color: '#7b8095' }}>Posted today</span></div></div>
  <div style={{ font: `900 70px/1 ${UI}`, letterSpacing: '-.04em', color: '#0d0f1a' }}>{j.role}</div>
  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><span style={{ font: `900 40px ${UI}`, color: '#141622', background: j.pop, padding: '12px 22px', borderRadius: 16 }}>{j.pay}</span>
    <span style={{ font: `600 28px ${UI}`, color: '#4c5268' }}>{j.town}</span></div>
  <div style={{ height: 1.5, background: 'rgba(20,22,34,.08)' }} />
  <div style={{ font: `600 28px ${UI}`, color: '#4c5268' }}>{j.shift}</div>
  <div style={{ font: `800 28px ${UI}`, color: j.brand }}>{j.status}</div></div>;

const Chip = ({ t, at, out, x, y, dir, j, children }) => { if (t < at) return null; const p = seg(t, at, at + 0.36), e = expo(p), o = inn(seg(t, out, out + 0.3));
  return <div style={{ position: 'absolute', left: lerp(x, 540 - 180, o), top: lerp(y + Math.sin((t - at) * 3) * 6, 730, o), display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px 18px 18px', borderRadius: 999, ...glass(0.75),
    opacity: clamp(p * 3, 0, 1) * (1 - o), transform: `translateX(${dir * 420 * (1 - e)}px) scale(${(0.7 + 0.3 * spring(p)) * (1 - 0.7 * o)})`, zIndex: 6 }}>
    <div style={{ width: 46, height: 46, borderRadius: 23, background: j.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px ${j.brand}88` }}><Check p={seg(t, at + 0.12, at + 0.36)} size={40} /></div>
    <span style={{ font: `800 32px ${UI}`, color: '#141622', whiteSpace: 'nowrap' }}>{children}</span></div>; };

const Scene = ({ j }) => {
  const t = useCurrentFrame() / JOBDROP3_FPS, S = (a, b) => seg(t, a, b);
  const push = 1 + 0.018 * t + 0.012 * Math.sin(t * 1.7);

  // hook -> pill -> search
  const sweep = S(1.12, 1.3), sweepOut = S(1.3, 1.48), collapse = ease(S(1.55, 1.8));
  const pill = expo(S(1.66, 2.15)), pw = lerp(520, 800, pill), ph = lerp(6, 96, pill);
  const query = `${j.role.toLowerCase().slice(0, 18)} jobs near me`, typed = query.slice(0, Math.floor(S(2.2, 3.0) * query.length));
  const [c1x, c1y] = route(t, [[2.75, 990, 1560], [3.3, 896, 976], [3.6, 896, 976]]);
  const wipe = Easing.bezier(0.6, 0, 0.3, 1)(S(3.45, 4.05));

  // cards
  const sw = expo(S(4.35, 5.0)), fan = expo(S(4.95, 5.45)), col = Easing.bezier(0.7, 0, 0.25, 1)(S(6.85, 7.3));
  const ry = lerp(78, -12, sw) + 6 * Math.sin((t - 5) * 1.6) * (1 - col), rx = lerp(30, 10, sw) * (1 - col);
  // tile -> plus -> apply pill
  const tileIn = S(7.0, 7.3), tileMove = Easing.bezier(0.65, 0, 0.25, 1)(S(7.35, 7.95)), plus = S(7.7, 7.95), grow = expo(S(8.0, 8.4));
  const ts = lerp(180, 112, tileMove), tx = 540, ty = lerp(730, 1391, tileMove);
  const applied = expo(S(8.85, 9.1)), bw = lerp(ts, lerp(380, 440, applied), grow);
  const [c2x, c2y] = route(t, [[8.15, 900, 1760], [8.7, 610, 1398], [9.3, 610, 1398], [9.6, 1000, 1700]]);
  const panel = expo(S(9.4, 9.95)), defocus = Easing.bezier(0.6, 0, 0.4, 1)(S(10.25, 10.7));

  return <AbsoluteFill style={{ background: '#07080D', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 40% at 50% ${lerp(68, 52, S(0, 3.4))}%, ${j.brand}77, transparent 70%)`, opacity: 0.75 + 0.25 * Math.sin(t * 5) }} />
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      {/* 1) hook */}
      {t < 1.85 && <div style={{ position: 'absolute', left: 40, right: 40, top: 740, textAlign: 'center', opacity: 1 - collapse, transform: `translateY(${collapse * 110}px) scaleY(${1 - 0.94 * collapse}) scaleX(${1 - 0.3 * collapse})`, filter: `blur(${collapse * 6}px)` }}>
        <div><Letters t={t} at={0.04} text="Still looking for" size={80} w={500} color="#c9cde0" stagger={0.018} /></div>
        <div><Whip t={t} at={0.42} dir={1}>work</Whip><Whip t={t} at={0.52} dir={-1}>that</Whip><Whip t={t} at={0.62} dir={1}>pays</Whip></div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Whip t={t} at={0.82} dir={-1} color={sweep >= 1 ? j.pop : '#fff'} glow={sweep >= 1 ? `${j.pop}aa` : undefined}>every</Whip><Whip t={t} at={0.94} dir={1} color={sweep >= 1 ? j.pop : '#fff'} glow={sweep >= 1 ? `${j.pop}aa` : undefined}>week?</Whip>
          {sweep > 0 && sweepOut < 1 && <div style={{ position: 'absolute', left: -10, right: -10, top: 6, bottom: 2, background: j.brand, borderRadius: 10, boxShadow: `0 0 50px ${j.brand}`,
            transform: `scaleX(${sweepOut > 0 ? 1 - ease(sweepOut) : ease(sweep)})`, transformOrigin: sweepOut > 0 ? 'right' : 'left' }} />}
        </div></div>}
      {/* 2) glowing pill becomes the search bar */}
      {t >= 1.66 && t < 4.1 && <div style={{ position: 'absolute', left: 540 - pw / 2, top: 968 - ph / 2, width: pw, height: ph, borderRadius: 48, overflow: 'hidden',
        background: pill < 1 ? j.brand : 'rgba(255,255,255,.07)', border: `1.5px solid rgba(255,255,255,${0.25 * pill})`, boxShadow: `0 0 ${lerp(30, 70, pill)}px ${j.brand}${pill < 1 ? 'cc' : '77'}`,
        display: 'flex', alignItems: 'center', padding: '0 14px 0 34px', gap: 18, boxSizing: 'border-box' }}>
        {pill >= 1 && <>
          <svg width={34} height={34} viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: S(2.15, 2.25) }}><circle cx={10} cy={10} r={7} fill="none" stroke="#c9cde0" strokeWidth={2.4} /><path d="M15 15 L21 21" stroke="#c9cde0" strokeWidth={2.4} strokeLinecap="round" /></svg>
          <span style={{ flex: 1, font: `500 36px ${UI}`, color: typed ? '#fff' : '#7b8095', whiteSpace: 'nowrap' }}>{typed || 'Search jobs'}{t < 3.1 && Math.floor(t * 4) % 2 === 0 ? <span style={{ display: 'inline-block', width: 3, height: 38, background: '#fff', marginLeft: 3, verticalAlign: 'middle' }} /> : null}</span>
          <div style={{ width: 68, height: 68, borderRadius: 34, flexShrink: 0, background: t >= 3.32 ? j.pop : j.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(S(2.2, 2.45)) * (t >= 3.32 && t < 3.42 ? 0.86 : 1)})` }}>
            <svg width={30} height={30} viewBox="0 0 24 24"><path d="M5 12 H19 M13 6 L19 12 L13 18" fill="none" stroke={t >= 3.32 ? '#141622' : '#fff'} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /></svg></div></>}
      </div>}
      {t >= 2.75 && t < 3.6 && <><Cursor x={c1x} y={c1y} press={t >= 3.3 && t < 3.42 ? 1 : 0} /><Ripple t={t} at={3.32} x={896} y={976} color="rgba(255,255,255,.75)" /></>}
    </AbsoluteFill>

    {/* 3) light world opens out of the search button */}
    {t >= 3.45 && <AbsoluteFill style={{ clipPath: `circle(${lerp(0, 2300, wipe)}px at 896px 976px)`, background: 'radial-gradient(ellipse 90% 55% at 50% 100%, #9FC7FF, transparent 70%), radial-gradient(ellipse 60% 40% at 15% 8%, #FFE9A8aa, transparent 70%), linear-gradient(#EEF0F6, #E3E8F3)',
      opacity: 1 - defocus }}>
      <AbsoluteFill style={{ transform: `scale(${push * (1 + 0.06 * (1 - expo(S(3.45, 4.3))))})`, filter: `blur(${defocus * 30}px)` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: 1 - S(6.8, 6.95) }}><Decode t={t} at={3.95} text="Found one." accent={j.brand} /></div>
        {t >= 7.3 && t < 9.4 && <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: 1 - S(9.25, 9.4) }}>
          <Letters t={t} at={7.32} text="Apply in " size={66} w={500} color="#4c5268" /><Letters t={t} at={7.5} text="41 seconds." size={66} w={900} />
          <div style={{ marginTop: 14 }}><Letters t={t} at={7.72} text={`${j.role} · ${j.pay}`} size={34} w={600} color="#7b8095" stagger={0.01} /></div></div>}

        {/* card stack */}
        {t >= 4.3 && t < 7.35 && <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', perspective: 1500, opacity: 1 - S(7.15, 7.32) }}>
          <div style={{ position: 'relative', transformStyle: 'preserve-3d', transform: `translateX(${(1 - sw) * 820}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${lerp(1, 0.28, col)})`, filter: `blur(${col * 6}px)` }}>
            {[[-1, 'Picker / Packer'], [1, 'Shipping Lead']].map(([d, r]) => <div key={r} style={{ position: 'absolute', inset: 0, transform: `translate(${d * 70 * fan * (1 - col)}px, ${-46 * fan * (1 - col)}px) rotate(${d * 7 * fan * (1 - col)}deg) translateZ(-60px)`, opacity: 0.85 * fan, filter: 'blur(2px)' }}>
              <div style={{ width: 640, height: 520, borderRadius: 44, ...glass(0.42) }} /></div>)}
            <div style={{ position: 'relative' }}><JobCard j={j} /></div></div></div>}
        <Chip t={t} at={5.35} out={6.7} x={70} y={1075} dir={-1} j={j}>{j.perks[0]}</Chip>
        <Chip t={t} at={5.6} out={6.75} x={470} y={1185} dir={1} j={j}>{j.perks[1]}</Chip>
        <Chip t={t} at={5.85} out={6.8} x={130} y={1295} dir={-1} j={j}>{j.perks[2]}</Chip>

        {/* app tile -> "+" -> "+ Apply" -> "Applied" */}
        {t >= 7.0 && t < 9.7 && <div style={{ position: 'absolute', left: tx - bw / 2, top: ty - ts / 2, width: bw, height: ts, borderRadius: lerp(44, 56, tileMove),
          background: applied > 0 ? '#14A35A' : plus > 0 ? `rgba(255,255,255,${0.9 * plus})` : 'transparent', backgroundImage: plus < 1 && applied === 0 ? `linear-gradient(140deg, ${j.brand}, #6B8BFF)` : 'none',
          boxShadow: applied > 0 ? `0 0 ${90 * applied}px rgba(20,163,90,.65)` : `0 24px 60px ${plus > 0.5 ? 'rgba(40,60,120,.22)' : `${j.brand}66`}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, overflow: 'hidden', opacity: tileIn * (1 - S(9.45, 9.7)),
          transform: `scale(${(0.4 + 0.6 * spring(tileIn)) * (t >= 8.8 && t < 8.9 ? 0.94 : 1)}) translateY(${-S(9.4, 9.7) * 120}px)` }}>
          {plus < 1 && <span style={{ font: `900 ${lerp(84, 52, tileMove)}px ${UI}`, color: '#fff', opacity: 1 - plus }}>{j.agency[0]}</span>}
          {plus > 0 && applied === 0 && <span style={{ position: plus < 1 ? 'absolute' : 'static', font: `800 42px ${UI}`, color: j.brand, opacity: plus, whiteSpace: 'nowrap' }}>+{grow > 0 ? <Letters t={t} at={8.08} text=" Apply" size={42} w={800} color={j.brand} stagger={0.03} /> : null}</span>}
          {applied > 0 && <><Check p={applied} size={56} /><span style={{ font: `800 42px ${UI}`, color: '#fff' }}>Applied</span></>}
        </div>}
        {t >= 8.15 && t < 9.6 && <><Cursor x={c2x} y={c2y} press={t >= 8.8 && t < 8.92 ? 1 : 0} /><Ripple t={t} at={8.84} x={614} y={1402} color="rgba(20,163,90,.7)" /></>}

        {/* confirmation panel */}
        {t >= 9.4 && <div style={{ position: 'absolute', left: 130, top: lerp(1950, 720, panel), width: 820, borderRadius: 44, padding: 52, boxSizing: 'border-box', display: 'grid', gap: 26, ...glass(0.85) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><div style={{ width: 64, height: 64, borderRadius: 32, background: '#14A35A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(20,163,90,.5)' }}><Check p={S(9.7, 9.95)} size={52} /></div>
            <span style={{ font: `900 50px ${UI}`, letterSpacing: '-.03em', color: '#0d0f1a' }}>Application received</span></div>
          {[['Role', `${j.role} · ${j.pay}`], ['Agency', j.agency], ['Next', 'A recruiter texts you today']].map(([k, v], i) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, paddingTop: 22, borderTop: '1.5px solid rgba(20,22,34,.08)',
            opacity: S(9.7 + i * 0.08, 9.9 + i * 0.08), transform: `translateY(${(1 - expo(S(9.7 + i * 0.08, 10 + i * 0.08))) * 30}px)` }}>
            <span style={{ font: `600 30px ${UI}`, color: '#7b8095' }}>{k}</span><span style={{ font: `800 30px ${UI}`, color: i === 2 ? j.brand : '#141622' }}>{v}</span></div>)}
        </div>}
      </AbsoluteFill>
    </AbsoluteFill>}

    {/* 4) end */}
    {t >= 10.55 && <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 35% at 50% 45%, #2b3350, #10121c 75%)`, opacity: S(10.45, 10.7), transform: `scale(${push})` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'grid', justifyItems: 'center', gap: 34 }}>
        <div style={{ width: 170, height: 170, borderRadius: 85, border: `7px solid ${j.brand}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${j.brand}aa, inset 0 0 40px ${j.brand}55`, transform: `scale(${spring(S(10.6, 10.95))})` }}>
          <Check p={S(10.8, 11.1)} size={130} /></div>
        <div><Whip t={t} at={10.95} dir={-1} size={78} w={900}>{j.agency.split(' ')[0]}</Whip><Whip t={t} at={11.05} dir={1} size={78} w={500} color="#c9cde0">{j.agency.split(' ').slice(1).join(' ')}</Whip></div>
        <div><Letters t={t} at={11.3} text="Tap the link in bio to apply" size={36} w={600} color="#9aa1b8" stagger={0.012} /></div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', font: `400 22px ${MONO}`, color: 'rgba(255,255,255,.4)', letterSpacing: 2 }}>{j.preview ? 'PREVIEW · MADE ON MONTERO.COOL' : 'SAMPLE REEL · FICTIONAL AGENCY'}</div>
    </AbsoluteFill>}
  </AbsoluteFill>;
};

export const JobDropV3 = (props) => {
  useFonts();
  const j = { ...JOB, ...props }, F = (s) => Math.round(s * JOBDROP3_FPS);
  const keys = Array.from({ length: 21 }, (_, k) => 2.2 + k * 0.8 / 21);
  const sfx = [['swoosh', 0.02, 0.5], ['whoosh', 0.4, 0.45], ['whoosh', 0.5, 0.3], ['whoosh', 0.6, 0.35], ['whoosh', 0.8, 0.4], ['whoosh', 0.92, 0.35], ['swoosh', 1.12, 0.5],
    ['thud', 1.62, 0.5], ['riser', 2.4, 0.3], ...keys.map((k) => ['tick', k, 0.16]), ['tap', 3.32, 0.9], ['whoosh', 3.45, 0.8], ['glitch', 3.95, 0.25], ['whoosh', 4.33, 0.7], ['swoosh', 4.95, 0.4],
    ['tick', 5.35, 0.6], ['tick', 5.6, 0.6], ['tick', 5.85, 0.6], ['whoosh', 6.85, 0.6], ['thud', 7.3, 0.5], ['swoosh', 7.4, 0.5], ['tick', 8.0, 0.5], ['tap', 8.82, 0.9], ['resolve', 8.86, 0.45],
    ['whoosh', 9.4, 0.6], ['tick', 9.75, 0.5], ['whoosh', 10.3, 0.6], ['endhit', 10.6, 0.4], ['whoosh', 10.95, 0.4]];
  return <AbsoluteFill>
    <Scene j={j} />
    {sfx.map(([s, at, v], k) => <Sequence key={k} from={F(at)} durationInFrames={F(s === 'riser' ? 2 : 1.2)}><Audio src={`/reels/jd_${s}.wav`} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
