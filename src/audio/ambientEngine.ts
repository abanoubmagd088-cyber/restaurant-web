// Procedural ambient "space restaurant" soundtrack synthesized with the Web Audio API.
// No external audio files required — everything is generated live in the browser.
// The sound is built from a slow evolving pad (stack of detuned oscillators), a
// gentle sub bass, soft filtered noise "air", and occasional shimmering bell tones,
// all routed through a gentle reverb-like feedback delay and a master gain.

export type AmbientEngineOptions = {
  masterVolume?: number;
};

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

const PAD_NOTES = [
  // A gentle, open A minor 9 voicing spread across octaves
  55.0, // A1
  82.41, // E2
  110.0, // A2
  164.81, // E3
  220.0, // A3
  277.18, // C#4
  329.63, // E4
  440.0, // A4
];

const BELL_NOTES = [
  440.0, // A4
  659.25, // E5
  880.0, // A5
  1108.73, // C#6
  1318.51, // E6
];

// Gentle pentatonic-ish bell sequence (frequencies in Hz)
const BELL_SEQUENCE = [880.0, 1318.51, 659.25, 1108.73, 880.0, 1760.0, 1318.51];

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padBus: GainNode | null = null;
  private bellBus: GainNode | null = null;
  private airBus: GainNode | null = null;
  private delay: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;
  private padVoices: Voice[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private airSource: AudioBufferSourceNode | null = null;
  private airFilter: BiquadFilterNode | null = null;
  private bellTimer: number | null = null;
  private chordTimer: number | null = null;

  private targetVolume: number;
  private _isStarted = false;
  private _isMuted = false;
  private currentVolume = 0;

  constructor(opts: AmbientEngineOptions = {}) {
    this.targetVolume = clampVolume(opts.masterVolume ?? 0.5);
  }

  get isStarted() {
    return this._isStarted;
  }

  get isMuted() {
    return this._isMuted;
  }

  get volume() {
    return this.targetVolume;
  }

  async start() {
    if (this._isStarted) return;
    this._isStarted = true;

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // ignore — will resume on next interaction
      }
    }

    // ---- Master chain -------------------------------------------------------
    const master = ctx.createGain();
    master.gain.value = 0; // fade in smoothly
    this.master = master;

    // Gentle lowpass to keep everything soft and warm
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 4200;
    masterFilter.Q.value = 0.4;

    master.connect(masterFilter);
    masterFilter.connect(ctx.destination);

    // ---- Reverb-ish feedback delay -----------------------------------------
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = 0.55;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    this.delay = delay;
    this.delayFeedback = feedback;
    this.delayWet = wet;

    // ---- Buses --------------------------------------------------------------
    const padBus = ctx.createGain();
    padBus.gain.value = 0.5;
    padBus.connect(master);
    padBus.connect(delay);
    this.padBus = padBus;

    const bellBus = ctx.createGain();
    bellBus.gain.value = 0.0;
    bellBus.connect(master);
    bellBus.connect(delay);
    this.bellBus = bellBus;

    const airBus = ctx.createGain();
    airBus.gain.value = 0.08;
    airBus.connect(master);
    this.airBus = airBus;

    // ---- Pad voices (detuned sine + triangle stack) ------------------------
    for (let i = 0; i < PAD_NOTES.length; i++) {
      const freq = PAD_NOTES[i];
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (i % 3) - 1; // tiny detune for width

      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(padBus);
      osc.start();
      this.padVoices.push({ osc, gain });
    }

    // Slow swell into the pad
    this.padVoices.forEach((v, i) => {
      const peak = 0.16 / (1 + i * 0.18);
      const t = ctx.currentTime + 1.5 + i * 0.45;
      v.gain.gain.setValueAtTime(0, ctx.currentTime);
      v.gain.gain.linearRampToValueAtTime(peak, t);
    });

    // ---- LFO modulating pad filter for movement ----------------------------
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    padFilter.Q.value = 0.8;
    padBus.disconnect();
    padBus.connect(padFilter);
    padFilter.connect(master);
    padFilter.connect(delay);
    lfoGain.connect(padFilter.frequency);
    lfo.start();
    this.lfo = lfo;
    this.lfoGain = lfoGain;

    // ---- Soft filtered noise "air" -----------------------------------------
    const noiseBuf = createNoiseBuffer(ctx, 4);
    const air = ctx.createBufferSource();
    air.buffer = noiseBuf;
    air.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 600;
    airFilter.Q.value = 0.7;
    air.connect(airFilter);
    airFilter.connect(airBus);
    air.start();
    this.airSource = air;
    this.airFilter = airFilter;

    // ---- Master fade-in -----------------------------------------------------
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(
      this._isMuted ? 0 : this.targetVolume,
      now + 4.5
    );
    this.currentVolume = this._isMuted ? 0 : this.targetVolume;

    // ---- Schedule evolving elements ---------------------------------------
    this.scheduleBell();
    this.scheduleChordShift();
  }

  private scheduleBell() {
    if (!this.ctx || !this.bellBus) return;
    const ctx = this.ctx;
    const playOne = (freq: number, at: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0;
      osc.connect(g);
      g.connect(this.bellBus!);
      const peak = 0.12;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(peak, at + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 5.5);
      osc.start(at);
      osc.stop(at + 6.2);
    };

    const step = () => {
      if (!this.ctx) return;
      const idx = Math.floor(Math.random() * BELL_SEQUENCE.length);
      const freq = BELL_SEQUENCE[idx] * (Math.random() < 0.3 ? 0.5 : 1);
      playOne(freq, this.ctx.currentTime + 0.1);
      // Occasionally add a harmony note
      if (Math.random() < 0.35) {
        const harm = BELL_NOTES[Math.floor(Math.random() * BELL_NOTES.length)];
        playOne(harm, this.ctx.currentTime + 0.5 + Math.random() * 0.8);
      }
      const next = 7000 + Math.random() * 9000;
      this.bellTimer = window.setTimeout(step, next);
    };
    this.bellTimer = window.setTimeout(step, 6000);
  }

  private scheduleChordShift() {
    // Slowly drift the pad filter cutoff for an evolving, breathing texture
    const step = () => {
      if (!this.ctx || !this.lfoGain) return;
      const target = 120 + Math.random() * 260;
      const now = this.ctx.currentTime;
      this.lfoGain.gain.cancelScheduledValues(now);
      this.lfoGain.gain.linearRampToValueAtTime(target, now + 8);
      this.chordTimer = window.setTimeout(step, 9000 + Math.random() * 7000);
    };
    this.chordTimer = window.setTimeout(step, 12000);
  }

  setVolume(v: number) {
    this.targetVolume = clampVolume(v);
    if (this._isMuted) return;
    this.rampMaster(this.targetVolume, 0.4);
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
    if (!this.ctx || !this.master) return;
    this.rampMaster(muted ? 0 : this.targetVolume, 0.6);
  }

  toggleMute() {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  private rampMaster(value: number, seconds: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.currentVolume, now);
    this.master.gain.linearRampToValueAtTime(value, now + seconds);
    this.currentVolume = value;
  }

  async stop() {
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.currentVolume, now);
      this.master.gain.linearRampToValueAtTime(0, now + 1.5);
    }
    const ctx = this.ctx;
    const voices = this.padVoices;
    const air = this.airSource;
    const lfo = this.lfo;
    const timers = [this.bellTimer, this.chordTimer];
    timers.forEach((t) => {
      if (t !== null) window.clearTimeout(t);
    });
    this.bellTimer = null;
    this.chordTimer = null;

    window.setTimeout(() => {
      voices.forEach((v) => {
        try {
          v.osc.stop();
        } catch {
          // already stopped
        }
      });
      try {
        air?.stop();
      } catch {
        // already stopped
      }
      try {
        lfo?.stop();
      } catch {
        // already stopped
      }
      if (ctx) {
        ctx.close().catch(() => {
          // ignore close errors
        });
      }
    }, 1700);

    this._isStarted = false;
    this.ctx = null;
    this.padVoices = [];
    this.airSource = null;
    this.lfo = null;
  }
}

function clampVolume(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function createNoiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.6;
  }
  return buffer;
}
