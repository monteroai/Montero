// Sound for the kinetic job ad, made in the browser (no files): a whoosh on every cut, ticks while the pay counts up,
// a thump when it lands and when the pin drops, a click when the button is tapped. Browsers only allow it after a tap.
const CUTS = [0.05, 1.55, 3.55, 5.15, 6.45]
const TICKS = Array.from({ length: 12 }, (_, i) => 1.74 + i * 0.07)
type Cue = [number, 'whoosh' | 'tick' | 'thump' | 'click', number]
const CUES: Cue[] = [...CUTS.map((t): Cue => [t, 'whoosh', 0]), ...TICKS.map((t, i): Cue => [t, 'tick', i]), [2.6, 'thump', 0], [5.4, 'thump', 1], [8.1, 'click', 0]]

export class AdSound {
  private ctx: AudioContext | null = null
  private last = 0
  on = false
  toggle() {
    if (!this.ctx) { const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!AC) return false; this.ctx = new AC() }
    this.on = !this.on; if (this.on) void this.ctx.resume(); return this.on
  }
  // call every frame with the ad's clock; plays whatever cue the clock just passed
  frame(t: number) {
    const a = this.last; this.last = t
    if (!this.on || !this.ctx || t < a || t - a > 0.5) return
    for (const [at, kind, n] of CUES) if (at > a && at <= t) this.play(kind, n)
  }
  private play(kind: Cue[1], n: number) {
    const c = this.ctx as AudioContext, now = c.currentTime, out = c.createGain(); out.connect(c.destination)
    if (kind === 'whoosh') {
      const len = Math.floor(c.sampleRate * 0.45), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
      const src = c.createBufferSource(); src.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2
      f.frequency.setValueAtTime(300, now); f.frequency.exponentialRampToValueAtTime(3200, now + 0.22); f.frequency.exponentialRampToValueAtTime(500, now + 0.45)
      out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.22, now + 0.16); out.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
      src.connect(f); f.connect(out); src.start(now); src.stop(now + 0.46)
    } else {
      const o = c.createOscillator()
      if (kind === 'tick') { o.type = 'triangle'; o.frequency.setValueAtTime(520 + n * 46, now); out.gain.setValueAtTime(0.09, now); out.gain.exponentialRampToValueAtTime(0.0001, now + 0.06); o.connect(out); o.start(now); o.stop(now + 0.07) }
      if (kind === 'thump') { o.type = 'sine'; o.frequency.setValueAtTime(n ? 150 : 190, now); o.frequency.exponentialRampToValueAtTime(48, now + 0.28); out.gain.setValueAtTime(0.5, now); out.gain.exponentialRampToValueAtTime(0.0001, now + 0.34); o.connect(out); o.start(now); o.stop(now + 0.35) }
      if (kind === 'click') { o.type = 'square'; o.frequency.setValueAtTime(1500, now); o.frequency.exponentialRampToValueAtTime(700, now + 0.04); out.gain.setValueAtTime(0.12, now); out.gain.exponentialRampToValueAtTime(0.0001, now + 0.07); o.connect(out); o.start(now); o.stop(now + 0.08) }
    }
  }
}
