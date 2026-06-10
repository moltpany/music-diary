(function () {
  "use strict";

  // ---- Notes & keyboard mapping --------------------------------------------
  // semitone: half steps above middle C (C4). step: diatonic position on the
  // treble staff (E4 = 0 = bottom line), sharps share the step of their letter.
  var NOTES = [
    { name: "C4",  semitone: 0,  black: false, key: "A", step: -2 },
    { name: "C#4", semitone: 1,  black: true,  key: "W", step: -2 },
    { name: "D4",  semitone: 2,  black: false, key: "S", step: -1 },
    { name: "D#4", semitone: 3,  black: true,  key: "E", step: -1 },
    { name: "E4",  semitone: 4,  black: false, key: "D", step: 0 },
    { name: "F4",  semitone: 5,  black: false, key: "F", step: 1 },
    { name: "F#4", semitone: 6,  black: true,  key: "T", step: 1 },
    { name: "G4",  semitone: 7,  black: false, key: "G", step: 2 },
    { name: "G#4", semitone: 8,  black: true,  key: "Y", step: 2 },
    { name: "A4",  semitone: 9,  black: false, key: "H", step: 3 },
    { name: "A#4", semitone: 10, black: true,  key: "U", step: 3 },
    { name: "B4",  semitone: 11, black: false, key: "J", step: 4 },
    { name: "C5",  semitone: 12, black: false, key: "K", step: 5 },
    { name: "C#5", semitone: 13, black: true,  key: "O", step: 5 },
    { name: "D5",  semitone: 14, black: false, key: "L", step: 6 },
    { name: "D#5", semitone: 15, black: true,  key: "P", step: 6 },
    { name: "E5",  semitone: 16, black: false, key: ";", step: 7 },
    { name: "F5",  semitone: 17, black: false, key: "'", step: 8 }
  ];

  var NOTE_BY_NAME = {};
  var KEY_TO_NOTE = {};
  NOTES.forEach(function (n) {
    NOTE_BY_NAME[n.name] = n;
    KEY_TO_NOTE[n.key.toLowerCase()] = n.name;
  });

  function freqOf(note) {
    return 261.626 * Math.pow(2, note.semitone / 12);
  }

  // ---- Melodies -------------------------------------------------------------
  var MELODIES = [
    {
      id: "ode",
      title: "欢乐颂 · 贝多芬",
      notes: ("E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 " +
              "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4").split(" ")
    },
    {
      id: "twinkle",
      title: "小星星 · 莫扎特变奏曲主题",
      notes: "C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4".split(" ")
    },
    {
      id: "elise",
      title: "致爱丽丝（开头）· 贝多芬",
      notes: "E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 G#4 B4 C5".split(" ")
    },
    {
      id: "free",
      title: "自由弹奏（不看谱）",
      notes: []
    }
  ];

  // ---- Web Audio synth -------------------------------------------------------
  var audio = { ctx: null, master: null };

  function ensureAudio() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return null; }
      audio.ctx = new AC();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.4;
      audio.master.connect(audio.ctx.destination);
    }
    if (audio.ctx.state === "suspended") { audio.ctx.resume(); }
    return audio.ctx;
  }

  // Each timbre's play() starts a voice and returns { stop: fn } so held keys
  // can sustain (strings/flute/organ) while struck ones decay (piano/music box).
  function buildVoice(ctx, freq, spec) {
    var env = ctx.createGain();
    env.gain.value = 0;
    var out = env;
    if (spec.filter) {
      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = spec.filter(freq);
      env.connect(filter);
      out = filter;
    }
    out.connect(audio.master);

    var nodes = [];
    spec.partials.forEach(function (p) {
      var osc = ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.value = freq * (p.ratio || 1) * (p.detune || 1);
      var g = ctx.createGain();
      g.gain.value = p.gain;
      osc.connect(g);
      g.connect(env);
      osc.start();
      nodes.push(osc);
    });

    if (spec.vibrato) {
      var lfo = ctx.createOscillator();
      lfo.frequency.value = spec.vibrato.rate;
      var depth = ctx.createGain();
      depth.gain.value = freq * spec.vibrato.depth;
      lfo.connect(depth);
      nodes.forEach(function (osc) { depth.connect(osc.frequency); });
      lfo.start();
      nodes.push(lfo);
    }

    var now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(spec.peak, now + spec.attack);
    if (spec.decayTo != null) {
      env.gain.exponentialRampToValueAtTime(Math.max(spec.decayTo, 0.0001), now + spec.attack + spec.decay);
    }

    var stopped = false;
    function kill(delay) {
      if (stopped) { return; }
      stopped = true;
      var t = ctx.currentTime;
      env.gain.cancelScheduledValues(t);
      env.gain.setValueAtTime(Math.max(env.gain.value, 0.0001), t);
      env.gain.exponentialRampToValueAtTime(0.0001, t + delay);
      nodes.forEach(function (n) { n.stop(t + delay + 0.05); });
    }
    // Self-stopping timbres clean up even if the key is never released.
    if (spec.maxSeconds) {
      setTimeout(function () { kill(0.2); }, spec.maxSeconds * 1000);
    }
    return { stop: function () { kill(spec.release); } };
  }

  var TIMBRES = {
    piano: {
      label: "钢琴",
      spec: function (freq) {
        return {
          partials: [
            { type: "triangle", gain: 0.7 },
            { type: "triangle", gain: 0.35, detune: 1.0035 },
            { type: "sine", gain: 0.18, ratio: 2 }
          ],
          filter: function (f) { return Math.min(f * 5, 7000); },
          attack: 0.005, peak: 1, decayTo: 0.001, decay: 2.4,
          release: 0.25, maxSeconds: 3
        };
      }
    },
    musicbox: {
      label: "八音盒",
      spec: function () {
        return {
          partials: [
            { type: "sine", gain: 0.8 },
            { type: "sine", gain: 0.22, ratio: 4 },
            { type: "sine", gain: 0.08, ratio: 7.2 }
          ],
          attack: 0.003, peak: 0.9, decayTo: 0.001, decay: 1.6,
          release: 0.6, maxSeconds: 2
        };
      }
    },
    strings: {
      label: "弦乐",
      spec: function (freq) {
        return {
          partials: [
            { type: "sawtooth", gain: 0.28 },
            { type: "sawtooth", gain: 0.28, detune: 0.996 },
            { type: "sawtooth", gain: 0.2, detune: 1.004 }
          ],
          filter: function (f) { return Math.min(f * 3.5, 3200); },
          vibrato: { rate: 5.5, depth: 0.004 },
          attack: 0.14, peak: 0.85, release: 0.45
        };
      }
    },
    flute: {
      label: "长笛",
      spec: function () {
        return {
          partials: [
            { type: "sine", gain: 0.85 },
            { type: "triangle", gain: 0.18 },
            { type: "sine", gain: 0.1, ratio: 2 }
          ],
          vibrato: { rate: 5, depth: 0.005 },
          attack: 0.07, peak: 0.9, release: 0.3
        };
      }
    },
    organ: {
      label: "管风琴",
      spec: function () {
        return {
          partials: [
            { type: "sine", gain: 0.55 },
            { type: "sine", gain: 0.3, ratio: 2 },
            { type: "sine", gain: 0.18, ratio: 3 },
            { type: "sine", gain: 0.12, ratio: 4 }
          ],
          attack: 0.03, peak: 0.85, release: 0.12
        };
      }
    }
  };

  // ---- State -----------------------------------------------------------------
  var state = {
    timbre: "piano",
    melody: MELODIES[0],
    pos: 0,
    finished: false,
    voices: {},      // note name -> active voice
    keysHeld: {}     // physical key -> note name (so keyup matches keydown)
  };

  function $(id) { return document.getElementById(id); }

  // ---- Sound + visuals ---------------------------------------------------------
  function noteOn(name) {
    var note = NOTE_BY_NAME[name];
    if (!note) { return; }
    var ctx = ensureAudio();
    if (ctx) {
      if (state.voices[name]) { state.voices[name].stop(); }
      state.voices[name] = buildVoice(ctx, freqOf(note), TIMBRES[state.timbre].spec(freqOf(note)));
    }
    var keyEl = document.querySelector('#play-keyboard [data-note="' + cssEscape(name) + '"]');
    if (keyEl) { keyEl.classList.add("is-down"); }
    advanceGame(name);
  }

  function noteOff(name) {
    if (state.voices[name]) {
      state.voices[name].stop();
      delete state.voices[name];
    }
    var keyEl = document.querySelector('#play-keyboard [data-note="' + cssEscape(name) + '"]');
    if (keyEl) { keyEl.classList.remove("is-down"); }
  }

  function cssEscape(value) {
    return String(value).replace(/([^a-zA-Z0-9_-])/g, "\\$1");
  }

  // ---- Game logic ---------------------------------------------------------------
  function advanceGame(name) {
    var melody = state.melody;
    if (!melody.notes.length || state.finished) { return; }
    var expected = melody.notes[state.pos];
    if (name === expected) {
      state.pos += 1;
      if (state.pos >= melody.notes.length) {
        state.finished = true;
        setStatus("🎉 弹完整首《" + melody.title.split(" ·")[0] + "》！换一首乐谱或换个音色再来一遍？");
        playFlourish();
      } else {
        setStatus("弹得对！第 " + (state.pos + 1) + " / " + melody.notes.length + " 个音。");
      }
      refreshScoreClasses();
      scrollScoreToCurrent();
    } else {
      flashWrong();
    }
  }

  function playFlourish() {
    var ctx = audio.ctx;
    if (!ctx) { return; }
    ["C4", "E4", "G4", "C5"].forEach(function (n, i) {
      setTimeout(function () {
        var note = NOTE_BY_NAME[n];
        var v = buildVoice(ctx, freqOf(note), TIMBRES[state.timbre].spec(freqOf(note)));
        setTimeout(function () { v.stop(); }, 350);
      }, 120 * i + 250);
    });
  }

  function resetGame() {
    state.pos = 0;
    state.finished = false;
    if (state.melody.notes.length) {
      setStatus("从第一个音开始：高亮的音符就是下一个要弹的键。");
    } else {
      setStatus("自由弹奏模式：没有乐谱，随便弹，享受音色就好。");
    }
    refreshScoreClasses();
    scrollScoreToCurrent();
  }

  function setStatus(text) {
    var el = $("play-status");
    if (el) { el.textContent = text; }
  }

  function flashWrong() {
    var current = document.querySelector("#play-score .score-note.is-current");
    if (!current) { return; }
    current.classList.add("is-wrong");
    setTimeout(function () { current.classList.remove("is-wrong"); }, 220);
  }

  // ---- Score rendering (SVG treble staff) -----------------------------------------
  var SCORE = { leftPad: 64, spacing: 44, bottomLineY: 88, halfGap: 6 };

  function renderScore() {
    var wrap = $("play-score");
    if (!wrap) { return; }
    var notes = state.melody.notes;
    if (!notes.length) {
      wrap.innerHTML = '<p class="score-free-note">自由弹奏模式没有乐谱——整张琴都是你的。</p>';
      return;
    }

    var width = SCORE.leftPad + notes.length * SCORE.spacing + 26;
    var parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="148" viewBox="0 0 ' + width + ' 148" role="img" aria-label="乐谱：' + state.melody.title + '">');

    // Five staff lines (bottom line = E4).
    for (var l = 0; l < 5; l++) {
      var y = SCORE.bottomLineY - l * SCORE.halfGap * 2;
      parts.push('<line class="score-line" x1="10" y1="' + y + '" x2="' + (width - 10) + '" y2="' + y + '"/>');
    }
    parts.push('<text class="score-clef" x="14" y="' + (SCORE.bottomLineY + 7) + '">𝄞</text>');

    notes.forEach(function (name, i) {
      var note = NOTE_BY_NAME[name];
      var x = SCORE.leftPad + i * SCORE.spacing;
      var y = SCORE.bottomLineY - note.step * SCORE.halfGap;
      var stemDown = note.step >= 4;
      var g = ['<g class="score-note" data-idx="' + i + '">'];
      // Ledger line for middle C / C# below the staff.
      if (note.step <= -2) {
        g.push('<line class="score-line" x1="' + (x - 10) + '" y1="' + y + '" x2="' + (x + 10) + '" y2="' + y + '"/>');
      }
      if (name.indexOf("#") !== -1) {
        g.push('<text class="score-accidental" x="' + (x - 17) + '" y="' + (y + 4) + '">♯</text>');
      }
      g.push('<ellipse class="score-head" cx="' + x + '" cy="' + y + '" rx="6.4" ry="4.8" transform="rotate(-18 ' + x + " " + y + ')"/>');
      if (stemDown) {
        g.push('<line class="score-stem" x1="' + (x - 6) + '" y1="' + y + '" x2="' + (x - 6) + '" y2="' + (y + 30) + '"/>');
      } else {
        g.push('<line class="score-stem" x1="' + (x + 6) + '" y1="' + y + '" x2="' + (x + 6) + '" y2="' + (y - 30) + '"/>');
      }
      // The computer key to press, printed under the staff as a play-along aid.
      g.push('<text class="score-key" x="' + x + '" y="128">' + note.key + "</text>");
      g.push("</g>");
      parts.push(g.join(""));
    });

    parts.push("</svg>");
    wrap.innerHTML = parts.join("");
    refreshScoreClasses();
  }

  function refreshScoreClasses() {
    var groups = document.querySelectorAll("#play-score .score-note");
    Array.prototype.forEach.call(groups, function (g, i) {
      g.classList.toggle("is-done", i < state.pos);
      g.classList.toggle("is-current", !state.finished && i === state.pos);
    });
  }

  function scrollScoreToCurrent() {
    var wrap = $("play-score");
    if (!wrap || !state.melody.notes.length) { return; }
    var idx = Math.min(state.pos, state.melody.notes.length - 1);
    var x = SCORE.leftPad + idx * SCORE.spacing;
    wrap.scrollLeft = Math.max(0, x - wrap.clientWidth / 2);
  }

  // ---- On-screen piano --------------------------------------------------------------
  function renderKeyboard() {
    var wrap = $("play-keyboard");
    if (!wrap) { return; }
    var whites = NOTES.filter(function (n) { return !n.black; });
    var whiteWidth = 100 / whites.length;
    var parts = [];

    whites.forEach(function (n) {
      parts.push(
        '<button type="button" class="piano-key piano-white" data-note="' + n.name + '" aria-label="' + n.name + '">' +
          '<span class="piano-keycap">' + n.key + "</span>" +
          '<span class="piano-notename">' + n.name.replace(/\d/, "") + "</span>" +
        "</button>"
      );
    });

    NOTES.forEach(function (n) {
      if (!n.black) { return; }
      // A black key sits on the boundary after the white key one semitone below.
      var whiteIdx = 0;
      for (var i = 0; i < whites.length; i++) {
        if (whites[i].semitone < n.semitone) { whiteIdx = i; }
      }
      var left = (whiteIdx + 1) * whiteWidth - whiteWidth * 0.3;
      parts.push(
        '<button type="button" class="piano-key piano-black" style="left:' + left.toFixed(3) + '%" data-note="' + n.name + '" aria-label="' + n.name + '">' +
          '<span class="piano-keycap">' + n.key + "</span>" +
        "</button>"
      );
    });

    wrap.innerHTML = parts.join("");

    Array.prototype.forEach.call(wrap.querySelectorAll(".piano-key"), function (btn) {
      var name = btn.getAttribute("data-note");
      var down = function (e) { e.preventDefault(); noteOn(name); };
      var up = function () { noteOff(name); };
      btn.addEventListener("mousedown", down);
      btn.addEventListener("mouseup", up);
      btn.addEventListener("mouseleave", up);
      btn.addEventListener("touchstart", down, { passive: false });
      btn.addEventListener("touchend", function (e) { e.preventDefault(); up(); });
      btn.addEventListener("touchcancel", up);
    });
  }

  // ---- Physical keyboard ----------------------------------------------------------
  function isTypingTarget(el) {
    if (!el) { return false; }
    var tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }

  function initPhysicalKeys() {
    document.addEventListener("keydown", function (e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) { return; }
      if (isTypingTarget(e.target)) { return; }
      var name = KEY_TO_NOTE[(e.key || "").toLowerCase()];
      if (!name || state.keysHeld[e.key]) { return; }
      e.preventDefault();
      state.keysHeld[e.key] = name;
      noteOn(name);
    });
    document.addEventListener("keyup", function (e) {
      var name = state.keysHeld[e.key];
      if (!name) { return; }
      delete state.keysHeld[e.key];
      noteOff(name);
    });
    window.addEventListener("blur", function () {
      Object.keys(state.keysHeld).forEach(function (k) { noteOff(state.keysHeld[k]); });
      state.keysHeld = {};
    });
  }

  // ---- Controls ---------------------------------------------------------------------
  function initControls() {
    var melodySel = $("play-melody");
    var timbreSel = $("play-timbre");
    var restart = $("play-restart");
    if (!melodySel || !timbreSel) { return; }

    melodySel.innerHTML = MELODIES.map(function (m) {
      return '<option value="' + m.id + '">' + m.title + "</option>";
    }).join("");
    timbreSel.innerHTML = Object.keys(TIMBRES).map(function (id) {
      return '<option value="' + id + '">' + TIMBRES[id].label + "</option>";
    }).join("");

    melodySel.addEventListener("change", function () {
      for (var i = 0; i < MELODIES.length; i++) {
        if (MELODIES[i].id === melodySel.value) { state.melody = MELODIES[i]; }
      }
      renderScore();
      resetGame();
    });
    timbreSel.addEventListener("change", function () {
      state.timbre = timbreSel.value;
    });
    if (restart) {
      restart.addEventListener("click", function () {
        resetGame();
        restart.blur();
      });
    }
  }

  // ---- Init ----------------------------------------------------------------------------
  function init() {
    if (!$("play-keyboard")) { return; }
    initControls();
    renderKeyboard();
    renderScore();
    initPhysicalKeys();
    resetGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
