import { AmbientEngine } from './ambientEngine';

// Section-aware audio controller. Wraps AmbientEngine and adds:
//  - smooth per-section volume/timbre shifts
//  - one-shot UI sound effects (hover, click, transition, hologram)
//  - a shared Web Audio context owned by the ambient engine

export type SectionId =
  | 'intro'
  | 'hero'
  | 'menu'
  | 'tour'
  | 'entertainment'
  | 'gallery'
  | 'reservation';

const SECTION_VOLUMES: Record<SectionId, number> = {
  intro: 0.45,
  hero: 0.5,
  menu: 0.4,
  tour: 0.45,
  entertainment: 0.55,
  gallery: 0.42,
  reservation: 0.38,
};

export class AudioController {
  private engine: AmbientEngine;
  private ctx: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private currentSection: SectionId = 'intro';
  private masterVolume = 0.5;

  constructor(engine: AmbientEngine) {
    this.engine = engine;
  }

  async start() {
    await this.engine.start();
    // Grab the context from the engine via a private-ish accessor.
    // We create a parallel sfx bus on the same context for sound effects.
    this.ctx = (this.engine as unknown as { ctx: AudioContext }).ctx;
    if (this.ctx) {
      const sfx = this.ctx.createGain();
      sfx.gain.value = 0.5;
      sfx.connect(this.ctx.destination);
      this.sfxBus = sfx;
    }
  }

  setSection(section: SectionId) {
    if (section === this.currentSection) return;
    this.currentSection = section;
    const vol = SECTION_VOLUMES[section] ?? 0.45;
    this.engine.setVolume(vol);
    this.playTransition();
  }

  setMasterVolume(v: number) {
    this.masterVolume = v;
    this.engine.setVolume(v);
  }

  setMuted(muted: boolean) {
    this.engine.setMuted(muted);
  }

  toggleMute() {
    return this.engine.toggleMute();
  }

  get isMuted() {
    return this.engine.isMuted;
  }

  // ---- Sound effects -------------------------------------------------------

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain = 0.15
  ) {
    if (!this.ctx || !this.sfxBus || this.engine.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playHover() {
    this.playTone(880, 0.12, 'sine', 0.06);
  }

  playClick() {
    this.playTone(660, 0.08, 'triangle', 0.1);
    this.playTone(990, 0.12, 'sine', 0.08);
  }

  playTransition() {
    // A soft futuristic sweep
    if (!this.ctx || !this.sfxBus || this.engine.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  playHologram() {
    // Shimmering arpeggio for hologram appearance
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      window.setTimeout(() => this.playTone(n, 0.3, 'sine', 0.08), i * 60);
    });
  }

  playWhoosh() {
    if (!this.ctx || !this.sfxBus || this.engine.isMuted) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.4);
    filter.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.1, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.sfxBus);
    noise.start(now);
    noise.stop(now + 0.5);
  }

  stop() {
    this.engine.stop();
  }
}
