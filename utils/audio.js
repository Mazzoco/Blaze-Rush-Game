// ============================================================
// AUDIO SYSTEM — Web Audio API procedural sounds
// ============================================================

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let bgNode = null;
  let musicEnabled = true;
  let sfxEnabled = true;

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(ctx.destination);
    } catch(e) { console.warn('Audio not available'); }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type = 'square', vol = 0.3, detune = 0) {
    if (!ctx || !sfxEnabled) return;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(masterGain);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  function noise(dur, vol = 0.1) {
    if (!ctx || !sfxEnabled) return;
    const bufSize = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(g);
    g.connect(masterGain);
    src.start();
    src.stop(ctx.currentTime + dur);
  }

  // ---- SFX ----
  const sfx = {
    jump()    { tone(300, 0.15, 'sine', 0.25); tone(500, 0.1, 'sine', 0.15); },
    land()    { noise(0.05, 0.15); },
    ring()    { tone(880, 0.08, 'sine', 0.25); tone(1100, 0.12, 'sine', 0.2); },
    hit()     { tone(150, 0.2, 'square', 0.3); noise(0.1, 0.15); },
    stomp()   { tone(200, 0.1, 'square', 0.3); tone(100, 0.15, 'sine', 0.2); noise(0.05, 0.1); },
    dash()    { tone(400, 0.08, 'sawtooth', 0.2); tone(600, 0.06, 'sawtooth', 0.15); },
    checkpoint(){ tone(660, 0.1, 'sine', 0.2); tone(880, 0.1, 'sine', 0.2); tone(1100, 0.2, 'sine', 0.2); },
    bossHit() { tone(220, 0.15, 'square', 0.3); noise(0.08, 0.2); },
    bossRoar(){ tone(80, 0.4, 'sawtooth', 0.35); tone(60, 0.5, 'sawtooth', 0.25); },
    die()     { tone(300, 0.1, 'square', 0.3); tone(250, 0.1, 'square', 0.3); tone(200, 0.1, 'square', 0.3); tone(150, 0.2, 'square', 0.25); },
    victory() {
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.3, 'sine', 0.25), i * 150);
      });
    },
    stageClr(){
      [523, 659, 784, 880, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.25, 'sine', 0.2), i * 120);
      });
    },
    projectile(){ tone(800, 0.06, 'sawtooth', 0.15); }
  };

  // ---- BGM: simple looping arpeggios ----
  let bgmTimer = null;
  let bgmStep = 0;

  const themes = {
    menu:   { notes: [261, 330, 392, 523, 392, 330], tempo: 180 },
    forest: { notes: [330, 392, 523, 659, 523, 392, 440, 523], tempo: 140 },
    cave:   { notes: [220, 277, 330, 220, 185, 220], tempo: 200 },
    ice:    { notes: [349, 440, 523, 659, 698, 659, 523], tempo: 160 },
    lava:   { notes: [196, 220, 247, 196, 175, 196], tempo: 130 },
    boss:   { notes: [165, 196, 220, 165, 147, 165], tempo: 120 },
    gameover: { notes: [220, 196, 175, 147], tempo: 300 }
  };

  function playBGM(name) {
    stopBGM();
    if (!musicEnabled || !ctx) return;
    bgmStep = 0;
    const theme = themes[name] || themes.menu;
    function step() {
      const note = theme.notes[bgmStep % theme.notes.length];
      tone(note, 0.12, 'triangle', 0.06);
      tone(note * 2, 0.08, 'sine', 0.04);
      bgmStep++;
      bgmTimer = setTimeout(step, theme.tempo);
    }
    step();
  }

  function stopBGM() {
    if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; }
  }

  return { init, resume, sfx, playBGM, stopBGM };
})();