/**
 * NARUTO NINJA RUN - Audio Engine
 * Procedural Web Audio API Synthesizer for high-energy Shinobi Music & SFX
 */

class ShinobiAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    this.isMuted = false;
    this.isBgmPlaying = false;
    this.currentTrack = null; // 'normal' | 'boss'
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.bgmBpm = 138;

    // Japanese Insen / Hirajoshi pentatonic scales
    // D, Eb, G, A, C (Insen)
    this.scaleNormal = [146.83, 155.56, 196.00, 220.00, 261.63, 293.66, 311.13, 392.00, 440.00, 523.25];
    // Boss tension scale: D minor / Phrygian dominant
    this.scaleBoss = [146.83, 155.56, 185.00, 220.00, 246.94, 293.66, 311.13, 369.99, 440.00, 493.88];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ==========================================
  // PROCEDURAL BACKGROUND MUSIC SEQUENCER
  // ==========================================
  playBgm(track = 'normal') {
    this.ensureContext();
    if (!this.ctx) return;

    if (this.currentTrack === track && this.isBgmPlaying) return;

    this.stopBgm();
    this.currentTrack = track;
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    const intervalMs = (60 / this.bgmBpm) * 250; // 16th note subdivision
    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || this.isMuted) return;
      this.tickBgm();
    }, intervalMs);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
    this.currentTrack = null;
  }

  tickBgm() {
    const t = this.ctx.currentTime;
    const step = this.bgmStep % 16;
    const bar = Math.floor(this.bgmStep / 16) % 4;

    if (this.currentTrack === 'normal') {
      // Taiko Drum (Kick) on beats 0, 4, 8, 12, with syncopation on 10, 14
      if (step === 0 || step === 6 || step === 8 || step === 12 || (bar % 2 === 1 && step === 14)) {
        this.synthTaiko(t, step === 0 ? 0.9 : 0.6);
      }
      // Bamboo Shaker / Hi-Hat on every 2 steps
      if (step % 2 === 0) {
        this.synthHiHat(t, step % 4 === 2 ? 0.25 : 0.12);
      }
      // Shamisen / Koto Melody
      const melodyNotes = [
        [5, -1, 4, 3, 5, -1, 6, 7], // bar 0
        [5, 4, 3, 2, 3, -1, 4, 5],   // bar 1
        [7, -1, 6, 5, 7, 8, 7, 6],   // bar 2
        [5, 4, 3, 2, 1, -1, 2, 3]    // bar 3
      ];
      const melodyBar = melodyNotes[bar];
      const noteIdx = melodyBar ? melodyBar[Math.floor(step / 2)] : -1;
      if (step % 2 === 0 && noteIdx >= 0) {
        const freq = this.scaleNormal[noteIdx % this.scaleNormal.length];
        this.synthShamisen(t, freq, 0.22);
      }
      // Bass line on root (D) and fourth (A)
      if (step === 0 || step === 8) {
        const bassFreq = (bar % 2 === 0) ? 73.42 : 55.00; // D2 or A1
        this.synthBass(t, bassFreq, 0.35);
      }
    } else if (this.currentTrack === 'boss') {
      // Rapid intense war drums
      if (step % 2 === 0) {
        this.synthTaiko(t, step % 4 === 0 ? 1.0 : 0.5);
      }
      // Fast hi-hat rolling
      this.synthHiHat(t, 0.18);

      // Urgent menacing brass / synth chords
      if (step === 0 || step === 3 || step === 6 || step === 10 || step === 12) {
        const bossNotes = [0, 1, 3, 4, 3, 1, 0, 4];
        const n = bossNotes[(bar * 2 + Math.floor(step / 4)) % bossNotes.length];
        const freq = this.scaleBoss[n];
        this.synthBossHorn(t, freq, 0.4);
      }
    }

    this.bgmStep++;
  }

  // ==========================================
  // PROCEDURAL INSTRUMENT SYNTHS
  // ==========================================
  synthTaiko(time, volume = 0.8) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep pitch drop
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);

    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  synthHiHat(time, volume = 0.15) {
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    whiteNoise.start(time);
  }

  synthShamisen(time, freq, volume = 0.25) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Filter snap for plucky string attack
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.2);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  synthBass(time, freq, volume = 0.3) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.38);
  }

  synthBossHorn(time, freq, volume = 0.35) {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.01, time); // slight detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.32);
    osc2.stop(time + 0.32);
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECTS (SFX)
  // ==========================================
  playJump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playDoubleJump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(720, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  playSlide() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // White noise gravel skid
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playShuriken() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Metallic ping + whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.08);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playRasengan() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // High speed oscillating energy vortex
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    lfo.frequency.setValueAtTime(25, t); // fast vibrato
    lfoGain.gain.setValueAtTime(100, t);

    lfo.connect(osc.frequency);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.5);
    osc.stop(t + 0.5);
  }

  playChidori() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1000 birds lightning crackle (modulated noise + high sawtooth)
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (i % 20 < 10 ? 1 : 0.2);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playFireball() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Deep roar + sweeping fire filter
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1500, t + 0.2);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playSubstitution() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Classic "POOF" smoke noise + wooden log thud
    // 1. Smoke poof
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(t);

    // 2. Wood block thud
    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

    oGain.gain.setValueAtTime(0.45, t + 0.05);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(oGain);
    oGain.connect(this.sfxGain);
    osc.start(t + 0.05);
    osc.stop(t + 0.28);
  }

  playHit() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playExplosion() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.45);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playPickupRamen() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Sparkling 3-note ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.18);
    });
  }

  playPickupScroll() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playBossWarning() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Siren war horn
    for (let i = 0; i < 2; i++) {
      const startTime = t + i * 0.45;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, startTime);
      osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.35);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.42);
    }
  }

  playBossDefeat() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Grand triumphant fanfare
    const chords = [
      [392.00, 493.88, 587.33], // G major
      [440.00, 554.37, 659.25], // A major
      [587.33, 739.99, 880.00]  // D major (triumph)
    ];

    chords.forEach((chord, step) => {
      const stepTime = t + step * 0.22;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, stepTime);

        const dur = step === 2 ? 0.6 : 0.2;
        gain.gain.setValueAtTime(0.2, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(stepTime);
        osc.stop(stepTime + dur + 0.05);
      });
    });
  }

  playGameOver() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Melancholy descending bell
    const notes = [440, 392, 349.23, 293.66, 220];
    notes.forEach((freq, i) => {
      const noteTime = t + i * 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }
}

// Global audio engine instance
window.shinobiAudio = new ShinobiAudioEngine();
