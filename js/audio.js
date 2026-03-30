/* ============================================
   AUDIO MANAGER
   Royalty-free jazz background music
   Uses Web Audio API for smooth playback
   ============================================ */

const AudioManager = {
  audioContext: null,
  isPlaying: false,
  oscillators: [],
  gainNode: null,
  masterGain: null,
  currentBeat: 0,
  tempo: 72, // BPM - smooth jazz tempo
  intervalId: null,

  // Jazz chord progressions (ii-V-I and common jazz voicings)
  chords: [
    // Dm7 - ii
    [293.66, 349.23, 440.00, 523.25],
    // G7 - V
    [196.00, 246.94, 349.23, 440.00],
    // Cmaj7 - I
    [261.63, 329.63, 392.00, 493.88],
    // Cmaj7
    [261.63, 329.63, 392.00, 493.88],
    // Fmaj7 - IV
    [174.61, 261.63, 329.63, 415.30],
    // Bm7b5
    [246.94, 293.66, 349.23, 440.00],
    // Em7
    [164.81, 246.94, 329.63, 440.00],
    // A7
    [220.00, 277.18, 329.63, 415.30],
    // Dm7
    [293.66, 349.23, 440.00, 523.25],
    // G7
    [196.00, 246.94, 349.23, 440.00],
    // Cmaj7
    [261.63, 329.63, 392.00, 493.88],
    // A7alt
    [220.00, 311.13, 369.99, 466.16],
  ],

  // Melody notes (pentatonic jazz licks)
  melodyNotes: [
    523.25, 587.33, 659.25, 783.99, 880.00,
    783.99, 659.25, 587.33, 523.25, 440.00,
    493.88, 587.33, 659.25, 523.25, 440.00,
    392.00, 440.00, 523.25, 587.33, 493.88,
    659.25, 587.33, 440.00, 523.25, 392.00,
    349.23, 440.00, 523.25, 659.25, 587.33,
    523.25, 440.00, 493.88, 392.00, 349.23,
    440.00, 523.25, 587.33, 659.25, 783.99,
  ],

  init() {
    const toggleBtn = document.getElementById('audio-toggle');
    const player = document.getElementById('audio-player');

    toggleBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
    });

    // Show player after splash
    setTimeout(() => {
      player.classList.add('visible');
    }, 2000);
  },

  createAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.15; // Keep it ambient
      this.masterGain.connect(this.audioContext.destination);

      // Add reverb-like effect using delay
      this.delayNode = this.audioContext.createDelay();
      this.delayNode.delayTime.value = 0.3;

      this.feedbackGain = this.audioContext.createGain();
      this.feedbackGain.gain.value = 0.2;

      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.delayNode.connect(this.masterGain);
    }
  },

  // Play a smooth jazz note
  playNote(freq, startTime, duration, type = 'sine', gain = 0.08, destination = null) {
    const ctx = this.audioContext;
    const dest = destination || this.masterGain;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Smooth envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.05);
    gainNode.gain.setValueAtTime(gain, startTime + duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(dest);

    // Also send to delay for that jazzy reverb
    gainNode.connect(this.delayNode);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.oscillators.push(osc);
  },

  // Schedule a bar of music
  scheduleBar(barStartTime) {
    const beatDuration = 60 / this.tempo;
    const barDuration = beatDuration * 4;
    const chordIndex = this.currentBeat % this.chords.length;
    const chord = this.chords[chordIndex];

    // Rhodes-style chord pad (warm sine + triangle blend)
    chord.forEach((freq) => {
      // Lower octave pad
      this.playNote(freq * 0.5, barStartTime, barDuration * 0.95, 'sine', 0.04);
      // Main voicing
      this.playNote(freq, barStartTime, barDuration * 0.9, 'sine', 0.025);
      // Slight triangle shimmer
      this.playNote(freq, barStartTime + 0.01, barDuration * 0.85, 'triangle', 0.01);
    });

    // Walking bass line
    const bassNotes = [chord[0] * 0.25, chord[1] * 0.25, chord[2] * 0.25, chord[0] * 0.25];
    bassNotes.forEach((freq, i) => {
      const slight = (Math.random() - 0.5) * 2; // Slight humanization
      this.playNote(freq + slight, barStartTime + (i * beatDuration), beatDuration * 0.85, 'sine', 0.06);
    });

    // Melody (with jazzy swing feel)
    const melodyStart = (this.currentBeat * 4) % this.melodyNotes.length;
    for (let i = 0; i < 4; i++) {
      // Swing feel: every other note slightly delayed
      const swingOffset = (i % 2 === 1) ? 0.06 : 0;
      const noteIndex = (melodyStart + i) % this.melodyNotes.length;

      // Only play some notes (jazz is about the space)
      if (Math.random() > 0.35) {
        const freq = this.melodyNotes[noteIndex];
        const noteDuration = beatDuration * (Math.random() * 0.5 + 0.4);
        this.playNote(
          freq,
          barStartTime + (i * beatDuration) + swingOffset,
          noteDuration,
          'sine',
          0.03
        );
      }
    }

    // Subtle hi-hat using noise-like high freq
    for (let i = 0; i < 8; i++) {
      if (Math.random() > 0.3) {
        const hatTime = barStartTime + (i * beatDuration * 0.5);
        this.playNote(
          8000 + Math.random() * 2000,
          hatTime,
          0.05,
          'sine',
          0.005
        );
      }
    }

    this.currentBeat++;
  },

  play() {
    this.createAudioContext();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.updateUI();

    const beatDuration = 60 / this.tempo;
    const barDuration = beatDuration * 4;

    // Schedule ahead
    let nextBarTime = this.audioContext.currentTime + 0.1;

    // Schedule initial bars
    for (let i = 0; i < 3; i++) {
      this.scheduleBar(nextBarTime + (i * barDuration));
    }

    // Keep scheduling
    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      nextBarTime = this.audioContext.currentTime + barDuration * 2;
      this.scheduleBar(nextBarTime);
    }, barDuration * 1000);
  },

  stop() {
    this.isPlaying = false;
    this.updateUI();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Fade out
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      setTimeout(() => {
        if (this.masterGain) {
          this.masterGain.gain.value = 0.15;
        }
      }, 600);
    }

    // Clean up oscillators
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.oscillators = [];
  },

  updateUI() {
    const iconOn = document.getElementById('audio-icon-on');
    const iconOff = document.getElementById('audio-icon-off');
    const visualizer = document.querySelector('.audio-visualizer');

    if (this.isPlaying) {
      iconOn.classList.remove('hidden');
      iconOff.classList.add('hidden');
      visualizer.classList.add('playing');
    } else {
      iconOn.classList.add('hidden');
      iconOff.classList.remove('hidden');
      visualizer.classList.remove('playing');
    }
  }
};
