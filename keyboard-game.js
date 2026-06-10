(function () {
  "use strict";

  // ---- Notes & keyboard mapping --------------------------------------------
  // semitone: half steps above middle C (C4).
  var NOTES = [
    { name: "C4",  semitone: 0,  black: false, key: "A" },
    { name: "C#4", semitone: 1,  black: true,  key: "W" },
    { name: "D4",  semitone: 2,  black: false, key: "S" },
    { name: "D#4", semitone: 3,  black: true,  key: "E" },
    { name: "E4",  semitone: 4,  black: false, key: "D" },
    { name: "F4",  semitone: 5,  black: false, key: "F" },
    { name: "F#4", semitone: 6,  black: true,  key: "T" },
    { name: "G4",  semitone: 7,  black: false, key: "G" },
    { name: "G#4", semitone: 8,  black: true,  key: "Y" },
    { name: "A4",  semitone: 9,  black: false, key: "H" },
    { name: "A#4", semitone: 10, black: true,  key: "U" },
    { name: "B4",  semitone: 11, black: false, key: "J" },
    { name: "C5",  semitone: 12, black: false, key: "K" },
    { name: "C#5", semitone: 13, black: true,  key: "O" },
    { name: "D5",  semitone: 14, black: false, key: "L" },
    { name: "D#5", semitone: 15, black: true,  key: "P" },
    { name: "E5",  semitone: 16, black: false, key: ";" },
    { name: "F5",  semitone: 17, black: false, key: "'" }
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
  // Demo scores all come from works collected in this diary (entryId links to
  // data/music-diary.json), transcribed into C-based jianpu; "|" marks a phrase
  // break shown as a barline. More playlist melodies can be added over time.
  var MELODIES = [
    {
      id: "elise",
      title: "致爱丽丝（开头）· 贝多芬",
      short: "致爱丽丝",
      entryId: "beethoven-fur-elise",
      score: "E5 D#5 E5 D#5 E5 B4 D5 C5 A4 | C4 E4 A4 B4 | E4 G#4 B4 C5"
    },
    {
      id: "wiegenlied",
      title: "摇篮曲（前半段）· 勃拉姆斯",
      short: "摇篮曲",
      entryId: "brahms-wiegenlied-op49-4",
      score: "E4 E4 G4 | E4 E4 G4 | E4 G4 C5 B4 | A4 A4 G4 | " +
             "D4 E4 F4 | D4 D4 E4 F4 | D4 F4 B4 A4 | G4 B4 C5"
    },
    {
      id: "imperial",
      title: "帝国进行曲（主题）· 约翰·威廉姆斯",
      short: "帝国进行曲",
      entryId: "jw-imperial-march",
      score: "G4 G4 G4 | D#4 A#4 G4 | D#4 A#4 G4 | " +
             "D5 D5 D5 | D#5 A#4 F#4 | D#4 A#4 G4"
    },
    {
      id: "free",
      title: "自由弹奏（不看谱）",
      short: "",
      entryId: null,
      score: ""
    }
  ];

  MELODIES.forEach(function (m) {
    m.tokens = m.score ? m.score.split(/\s+/) : [];
    m.notes = m.tokens.filter(function (t) { return t !== "|"; });
  });

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
        setStatus("🎉 弹完了《" + (melody.short || melody.title) + "》！换一首乐谱或换个音色再来一遍？");
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

  // ---- Score rendering (简谱 numbered notation) ------------------------------------
  // Numbers are C-based jianpu (1 = C4)：a dot above means the higher octave,
  // ♯ marks a sharp; the keyboard letter to press sits right under each number.
  function jianpuOf(name) {
    var degree = { C: 1, D: 2, E: 3, F: 4, G: 5, A: 6, B: 7 }[name.charAt(0)];
    return {
      num: degree,
      sharp: name.indexOf("#") !== -1,
      high: name.charAt(name.length - 1) === "5"
    };
  }

  function renderScore() {
    var wrap = $("play-score");
    if (!wrap) { return; }
    var melody = state.melody;
    if (!melody.notes.length) {
      wrap.innerHTML = '<p class="score-free-note">自由弹奏模式没有乐谱——整张琴都是你的。</p>';
      renderEntryLink();
      return;
    }

    var parts = [];
    var idx = 0;
    melody.tokens.forEach(function (tok) {
      if (tok === "|") {
        parts.push('<span class="jianpu-bar" aria-hidden="true"></span>');
        return;
      }
      var note = NOTE_BY_NAME[tok];
      var jp = jianpuOf(tok);
      parts.push(
        '<span class="jianpu-note score-note" data-idx="' + idx + '">' +
          '<span class="jianpu-dot' + (jp.high ? " is-on" : "") + '"></span>' +
          '<span class="jianpu-num">' + (jp.sharp ? "♯" : "") + jp.num + "</span>" +
          '<span class="jianpu-key">' + note.key + "</span>" +
        "</span>"
      );
      idx += 1;
    });
    wrap.innerHTML = '<div class="jianpu-sheet" role="img" aria-label="简谱：' + melody.title + '">' + parts.join("") + "</div>";
    renderEntryLink();
    refreshScoreClasses();
  }

  function renderEntryLink() {
    var box = $("play-entry");
    if (!box) { return; }
    var melody = state.melody;
    if (!melody.entryId) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML =
      "<span>这段旋律来自日记里收藏的作品：</span>" +
      '<button type="button" class="play-entry-link" id="play-entry-link">查看《' + melody.short + "》作品详情 →</button>";
    $("play-entry-link").addEventListener("click", function () {
      if (typeof window.musicDiarySelectEntry === "function") {
        window.musicDiarySelectEntry(melody.entryId, { focusMap: true, scrollDetail: true });
      } else {
        window.location.hash = "#detail";
      }
    });
  }

  function refreshScoreClasses() {
    var groups = document.querySelectorAll("#play-score .score-note");
    Array.prototype.forEach.call(groups, function (g, i) {
      g.classList.toggle("is-done", i < state.pos);
      g.classList.toggle("is-current", !state.finished && i === state.pos);
    });
  }

  function scrollScoreToCurrent() {
    var el = document.querySelector("#play-score .score-note.is-current");
    if (el && el.scrollIntoView) { el.scrollIntoView({ block: "nearest", inline: "nearest" }); }
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
