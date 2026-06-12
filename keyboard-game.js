(function () {
  "use strict";

  // ---- Notes & keyboard mapping --------------------------------------------
  // Two and a half octaves (C3–F5), laid out like common virtual-piano sites so
  // both hands can play: left hand C3–B3 on the bottom row (blacks on the home
  // row), right hand C4–F5 on the QWERTY row (blacks on the number row).
  // semitone: half steps above middle C (C4).
  var NOTES = [
    { name: "C3",  semitone: -12, black: false, key: "Z" },
    { name: "C#3", semitone: -11, black: true,  key: "S" },
    { name: "D3",  semitone: -10, black: false, key: "X" },
    { name: "D#3", semitone: -9,  black: true,  key: "D" },
    { name: "E3",  semitone: -8,  black: false, key: "C" },
    { name: "F3",  semitone: -7,  black: false, key: "V" },
    { name: "F#3", semitone: -6,  black: true,  key: "G" },
    { name: "G3",  semitone: -5,  black: false, key: "B" },
    { name: "G#3", semitone: -4,  black: true,  key: "H" },
    { name: "A3",  semitone: -3,  black: false, key: "N" },
    { name: "A#3", semitone: -2,  black: true,  key: "J" },
    { name: "B3",  semitone: -1,  black: false, key: "M" },
    { name: "C4",  semitone: 0,   black: false, key: "Q" },
    { name: "C#4", semitone: 1,   black: true,  key: "2" },
    { name: "D4",  semitone: 2,   black: false, key: "W" },
    { name: "D#4", semitone: 3,   black: true,  key: "3" },
    { name: "E4",  semitone: 4,   black: false, key: "E" },
    { name: "F4",  semitone: 5,   black: false, key: "R" },
    { name: "F#4", semitone: 6,   black: true,  key: "5" },
    { name: "G4",  semitone: 7,   black: false, key: "T" },
    { name: "G#4", semitone: 8,   black: true,  key: "6" },
    { name: "A4",  semitone: 9,   black: false, key: "Y" },
    { name: "A#4", semitone: 10,  black: true,  key: "7" },
    { name: "B4",  semitone: 11,  black: false, key: "U" },
    { name: "C5",  semitone: 12,  black: false, key: "I" },
    { name: "C#5", semitone: 13,  black: true,  key: "9" },
    { name: "D5",  semitone: 14,  black: false, key: "O" },
    { name: "D#5", semitone: 15,  black: true,  key: "0" },
    { name: "E5",  semitone: 16,  black: false, key: "P" },
    { name: "F5",  semitone: 17,  black: false, key: "[" }
  ];

  var NOTE_BY_NAME = {};
  var KEY_TO_NOTE = {};
  NOTES.forEach(function (n) {
    NOTE_BY_NAME[n.name] = n;
    KEY_TO_NOTE[n.key.toLowerCase()] = n.name;
  });

  // Bottom-row extension: ", . /" continue past M into the middle octave (same
  // notes as Q W E), with L and ; as the black keys in between — so the left
  // hand can reach C4–E4 without jumping rows. Aliases only affect key input;
  // the on-screen piano keeps showing each note's primary keycap.
  var KEY_ALIASES = { ",": "C4", "l": "C#4", ".": "D4", ";": "D#4", "/": "E4" };
  Object.keys(KEY_ALIASES).forEach(function (k) { KEY_TO_NOTE[k] = KEY_ALIASES[k]; });

  function freqOf(note) {
    return 261.626 * Math.pow(2, note.semitone / 12);
  }

  // ---- Melodies -------------------------------------------------------------
  // Demo scores all come from works collected in this diary (entryId links to
  // data/music-diary.json), transcribed into C-based jianpu. "|" marks a phrase
  // break shown as a barline; "A4+A3" means both notes belong to one step (a
  // two-hand chord: melody first, bass after the plus). The "（双手）" scores use
  // simplified accompaniments — bass notes only, marked as arrangements.
  // 旋律均与公开记谱来源逐音核对（Mutopia/Wikifonia 的 LilyPond/ABC 转录、字母谱教程，
  // 至少两个独立来源吻合才收录），必要时整体移调装入 C3–F5 音域。
  var MELODIES = [
    {
      id: "elise-intro",
      group: "钢琴与器乐",
      title: "致爱丽丝 · 开头（右手入门）",
      short: "致爱丽丝",
      entryId: "beethoven-fur-elise",
      score: "E5 D#5 E5 D#5 E5 B4 D5 C5 A4 | C4 E4 A4 B4 | E4 G#4 B4 C5"
    },
    {
      id: "elise-a",
      group: "钢琴与器乐",
      title: "致爱丽丝 · A 段完整（双手）",
      short: "致爱丽丝",
      entryId: "beethoven-fur-elise",
      score: "E5 D#5 | E5 D#5 E5 B4 D5 C5 | A4+A3 C4 E4 A4 | B4+E3 E4 G#4 B4 | " +
             "C5+A3 E4 E5 D#5 | E5 D#5 E5 B4 D5 C5 | A4+A3 C4 E4 A4 | B4+E3 E4 C5 B4 | A4+A3"
    },
    {
      // 核对：madrisan/open-scores 与 Buschke/sheet-music（Mutopia）两份 LilyPond 逐音吻合；F 大调原调
      id: "traumerei",
      group: "钢琴与器乐",
      title: "梦幻曲 · 开头（右手）· 舒曼",
      short: "梦幻曲",
      entryId: "schumann-traumerei",
      score: "C4 | F4 E4 F4 A4 | C5 F5 | F5 E5 D5 C5"
    },
    {
      // 核对：Mutopia 与 rdj/music 两份 LilyPond 逐音吻合；降D原调整体下移纯四度入音域
      id: "clair",
      group: "钢琴与器乐",
      title: "月光 · 开头（右手 · 移调）· 德彪西",
      short: "月光",
      entryId: "debussy-clair-de-lune",
      score: "D#4 | D#5 C5 | C5 A#4 C5 A#4 | A#4 G#4 A#4 G#4 C5 C5 G#4 | " +
             "G#4 G4 G#4 G4 | G4 F4 G4 F4 A#4 F4 D#4 F4 D#4 | D#4 C#4 D#4 C#4 C4"
    },
    {
      // 核对：演奏 MIDI、OpenEWLD 领谱、classtab 等四源一致的主题动机；降A原调
      id: "liebestraum",
      group: "钢琴与器乐",
      title: "爱之梦 · 主题（右手）· 李斯特",
      short: "爱之梦",
      entryId: "liszt-liebestraum-3",
      score: "C4 C4 C4 C4 C#4 C4 | F3 G3 G#3 C4 A#3 | G#3"
    },
    {
      // 核对：Mutopia 与 rdj/music 两份 LilyPond 逐音吻合；降E原调整体低八度入音域
      id: "nocturne",
      group: "钢琴与器乐",
      title: "夜曲 Op.9-2 · 开头（右手 · 低八度）· 肖邦",
      short: "夜曲",
      entryId: "chopin-nocturne-op9-2",
      score: "A#3 | G4 G4 F4 G4 F4 D#4 A#3 | G4 C4 C5 G4 A#4 G#4 G4 | " +
             "F4 G4 D4 D#4 C4 | A#3 D5 C5 A#4 G#4 G4 G#4 C4 D4 D#4"
    },
    {
      // 核对：肖邦学院 humdrum-chopin-first-editions 两版初版数字化逐音吻合；E 大调原调
      id: "etude",
      group: "钢琴与器乐",
      title: "离别曲 · 开头（右手）· 肖邦",
      short: "离别曲",
      entryId: "chopin-etude-op10-3",
      score: "B3 | E4 D#4 E4 F#4 | F#4 G#4 G#4 F#4 G#4 | G#4 A4 A4 G#4 C#5 B4 | " +
             "A4 G#4 D#4 E4 F#4 | F#4 G#4 G#4 F#4 E4"
    },
    {
      // 核对：nwhetsell 圆号/大提琴 LilyPond 与独立 ABC 全谱逐音吻合；G 大调原调（大提琴音区，多用左手区）
      id: "cygne",
      group: "钢琴与器乐",
      title: "天鹅 · 开头（低音区）· 圣-桑",
      short: "天鹅",
      entryId: "saint-saens-le-cygne",
      score: "G4 F#4 B3 E4 D4 G3 | A3 B3 C4 | E3 F#3 G3 A3 B3 C4 D4 E4 F#4 | B4 | " +
             "G4 F#4 B3 E4 D4 G3 | A#3 B3 C#4"
    },
    {
      // 核对：cellist 仓库两位编曲者（D 大调/G 大调）逐音吻合；取 D 大调版低八度入音域
      id: "salut",
      group: "钢琴与器乐",
      title: "爱的礼赞 · 开头（右手 · 移调）· 埃尔加",
      short: "爱的礼赞",
      entryId: "elgar-salut-damour",
      score: "F#4 A3 F#4 | E4 D4 C#4 D4 | G4 G4 | G4 A3 | F#4 A#3 F#4 | E4 D4 C#4 D4 | E4 E4"
    },
    {
      // 核对：glorl/LilyArchive 与莫扎特数字版（DME）转录逐音吻合；C 大调原调低八度入音域
      id: "romanze",
      group: "钢琴与器乐",
      title: "弦乐小夜曲 Romanze · 主题（右手 · 低八度）· 莫扎特",
      short: "弦乐小夜曲 Romanze",
      entryId: "mozart-eine-kleine-nachtmusik-romanze",
      score: "E4 E4 | E4 G4 F4 D4 F4 A4 | G4 E4 G4 C5 C5 B4 | A4 A4 G4 G4 F4 F4 E4 | G4 E4 D4 | " +
             "E4 E4 | E4 G4 F4 D4 F4 A4 | G4 E4 G4 C5 G4 G4 E4 | D4 A4 | F4 E4 D4 C4 | E4 D4 C4 D4 | C4"
    },
    {
      // 核对：Mutopia Wiegenlied.ly + kjpye/Songs BrahmsLullaby.ly（降E原调移到 C）
      id: "wiegenlied",
      group: "声乐与歌剧",
      title: "摇篮曲 · 完整（右手）· 勃拉姆斯",
      short: "摇篮曲",
      entryId: "brahms-wiegenlied-op49-4",
      score: "E4 E4 G4 | E4 E4 G4 | E4 G4 C5 B4 | A4 A4 G4 | " +
             "D4 E4 F4 | D4 D4 E4 F4 | D4 F4 B4 A4 | G4 B4 C5 | " +
             "C4 C4 C5 | A4 F4 G4 | E4 C4 F4 G4 A4 G4 | " +
             "C4 C4 C5 | A4 F4 G4 | E4 C4 F4 E4 D4 C4"
    },
    {
      // 核对：Chris Brace ABC（D小调）+ cellist 四重奏 LilyPond（G小调，移调逐音吻合）
      id: "standchen",
      group: "声乐与歌剧",
      title: "小夜曲 · 开头（右手）· 舒伯特",
      short: "小夜曲",
      entryId: "schubert-standchen",
      score: "A4 A#4 A4 D5 A4 | G4 A4 G4 D5 G4 | A4 G4 G4 F4 E4 | F4"
    },
    {
      // 核对：Wikifonia Habanera 领谱 + 独立 ABC 转录（低全音版，音程逐一吻合）
      id: "habanera",
      group: "声乐与歌剧",
      title: "哈巴涅拉 · 开头（右手）· 比才",
      short: "哈巴涅拉",
      entryId: "bizet-carmen-habanera",
      score: "D5 C#5 | C5 C5 B4 A#4 | A4 A4 G#4 G4 | F4 G4 F4 E4 F4 G4 F4 | D4"
    },
    {
      // 核对：cellist LilyPond（降B原调）+ abc2book ABC（G大调版，此处采用 G 版避免连串升降号）
      id: "voi-che-sapete",
      group: "声乐与歌剧",
      title: "你们可知道 · 开头（右手）· 莫扎特",
      short: "你们可知道",
      entryId: "mozart-voi-che-sapete",
      score: "G4 D4 D4 | A4 D4 | B4 G4 A4 B4 C5 | B4 A4"
    },
    {
      // 核对：ASF Brindisi ABC + Mutopia Traviata_02.ly（降B原调，含两处半音回音）
      id: "libiamo",
      group: "声乐与歌剧",
      title: "祝酒歌 · 开头（右手）· 威尔第",
      short: "祝酒歌",
      entryId: "verdi-libiamo",
      score: "D5 | D5 F5 D#5 | D5 D5 C#5 D5 D#5 | C5 C5 B4 C5 D5 | A#4"
    },
    {
      // 核对：andrewminer LilyPond（B小调）+ Wikifonia 领谱（A小调，移调吻合）；整体下移纯四度入音域
      id: "lucevan",
      group: "声乐与歌剧",
      title: "星光灿烂 · 主题（右手）· 普契尼",
      short: "星光灿烂",
      entryId: "puccini-e-lucevan-le-stelle",
      score: "C#4 | G#4 A4 B4 C#5 | B4 A4 G#4 C#4 | F#4 F#4 G#4 A4 | " +
             "D4 D4 D4 E4 F#4 G#4 A4 | B4 C#5 D5 E5 D5 B4 | C#5"
    },
    {
      id: "imperial",
      group: "电影配乐",
      title: "帝国进行曲 · 主题（右手）",
      short: "帝国进行曲",
      entryId: "jw-imperial-march",
      score: "G4 G4 G4 | D#4 A#4 G4 | D#4 A#4 G4 | " +
             "D5 D5 D5 | D#5 A#4 F#4 | D#4 A#4 G4"
    },
    {
      id: "imperial-duo",
      group: "电影配乐",
      title: "帝国进行曲 · 主题（双手低音）",
      short: "帝国进行曲",
      entryId: "jw-imperial-march",
      score: "G4+G3 G4 G4 | D#4+G3 A#4 G4 | D#4+G3 A#4 G4 | " +
             "D5 D5 D5 | D#5 A#4 F#4 | D#4+G3 A#4 G4"
    },
    {
      // 核对：A小调与E小调两版字母谱互相移调验证（含忠实版的 G#/A# 半音）
      id: "hedwig",
      group: "电影配乐",
      title: "海德薇主题 · 开头（右手）",
      short: "海德薇主题",
      entryId: "jw-hedwig-theme",
      score: "E4 | A4 C5 B4 | A4 E5 | D5 B4 | A4 C5 B4 | G#4 A#4 | E4"
    },
    {
      // 核对：两个字母谱来源逐音吻合（C大调易弹版）
      id: "jurassic",
      group: "电影配乐",
      title: "侏罗纪公园 · 主题（右手）",
      short: "侏罗纪公园",
      entryId: "jw-jurassic-park",
      score: "C5 B4 C5 C5 B4 C5 | C5 B4 C5 D5 D5 | F5 F5 E5 C5 D5 B4 G4 | E5 C5 D5 G4"
    },
    {
      // 核对：两个易弹谱来源逐音吻合（C大调版）
      id: "raiders",
      group: "电影配乐",
      title: "夺宝奇兵 · 开头（右手）",
      short: "夺宝奇兵进行曲",
      entryId: "jw-raiders-march",
      score: "E4 F4 G4 C5 | D4 E4 F4 | G4 A4 B4 F5 | A4 B4 C5 D5 E5"
    },
    {
      // 核对：多个来源确认五音为 Re Mi Do Do(低八度) Sol；影片中反复出现，这里弹两遍
      id: "encounters",
      group: "电影配乐",
      title: "第三类接触 · 五音动机（含左手）",
      short: "第三类接触",
      entryId: "jw-close-encounters",
      score: "D4 E4 C4 C3 G3 | D4 E4 C4 C3 G3"
    },
    {
      id: "free",
      group: "",
      title: "自由弹奏（不看谱）",
      short: "",
      entryId: null,
      score: ""
    }
  ];

  MELODIES.forEach(function (m) {
    m.tokens = m.score ? m.score.split(/\s+/) : [];
    // steps: each playable position is an array of note names (1 = single note,
    // 2 = a two-hand chord that must all be pressed to advance).
    m.steps = m.tokens
      .filter(function (t) { return t !== "|"; })
      .map(function (t) { return t.split("+"); });
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
    guitar: {
      label: "吉他",
      spec: function (freq) {
        return {
          partials: [
            { type: "triangle", gain: 0.55 },
            { type: "sawtooth", gain: 0.22 },
            { type: "sine", gain: 0.18, ratio: 2 },
            { type: "sine", gain: 0.06, ratio: 3 }
          ],
          // darker cap than the piano gives the nylon-string warmth
          filter: function (f) { return Math.min(f * 3.2, 2800); },
          attack: 0.003, peak: 0.95, decayTo: 0.001, decay: 1.3,
          release: 0.18, maxSeconds: 2
        };
      }
    },
    violin: {
      label: "小提琴",
      spec: function (freq) {
        return {
          partials: [
            { type: "sawtooth", gain: 0.38 },
            { type: "sawtooth", gain: 0.1, detune: 1.002 },
            { type: "sine", gain: 0.2 }
          ],
          // solo voice: brighter and with a wider vibrato than the ensemble strings
          filter: function (f) { return Math.min(f * 4.5, 4200); },
          vibrato: { rate: 6, depth: 0.007 },
          attack: 0.08, peak: 0.8, release: 0.3
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
    got: {},         // notes of the current step already pressed (for chords)
    finished: false,
    octave: 0,       // whole-keyboard octave shift, -1..+1 ("-" / "=" keys)
    voices: {},      // note name -> active voice
    keysHeld: {}     // physical key -> note name (so keyup matches keydown)
  };

  function $(id) { return document.getElementById(id); }

  // ---- Octave shift -------------------------------------------------------------
  function shiftNoteName(name, shift) {
    if (!shift) { return name; }
    var octave = parseInt(name.charAt(name.length - 1), 10) + shift;
    return name.slice(0, -1) + octave;
  }

  function setOctave(value) {
    state.octave = Math.max(-1, Math.min(1, value));
    var label = $("play-octave-label");
    if (label) {
      label.textContent = state.octave === 0 ? "原位" : (state.octave > 0 ? "+1 八度" : "−1 八度");
    }
  }

  // ---- Sound + visuals ---------------------------------------------------------
  function noteOn(name) {
    var note = NOTE_BY_NAME[name];
    if (!note) { return; }
    var ctx = ensureAudio();
    if (ctx) {
      if (state.voices[name]) { state.voices[name].stop(); }
      var freq = freqOf(note) * Math.pow(2, state.octave);
      state.voices[name] = buildVoice(ctx, freq, TIMBRES[state.timbre].spec(freq));
    }
    var keyEl = document.querySelector('#play-keyboard [data-note="' + cssEscape(name) + '"]');
    if (keyEl) { keyEl.classList.add("is-down"); }
    // The game listens to the *sounding* pitch, so an octave-shifted keyboard
    // still has to produce the score's written notes to advance.
    advanceGame(shiftNoteName(name, state.octave));
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
    if (!melody.steps.length || state.finished) { return; }
    var expected = melody.steps[state.pos];
    if (expected.indexOf(name) === -1) {
      flashWrong();
      return;
    }
    state.got[name] = true;
    var missing = expected.filter(function (n) { return !state.got[n]; });
    if (missing.length) {
      // A chord step: wait for the other hand (notes may land in any order).
      setStatus("还差一个音：再按 " + missing.map(function (n) {
        return NOTE_BY_NAME[n].key;
      }).join(" 和 ") + "。");
      refreshScoreClasses();
      return;
    }
    state.pos += 1;
    state.got = {};
    if (state.pos >= melody.steps.length) {
      state.finished = true;
      setStatus("🎉 弹完了《" + (melody.short || melody.title) + "》！换一首乐谱或换个音色再来一遍？");
      playFlourish();
    } else {
      setStatus("弹得对！第 " + (state.pos + 1) + " / " + melody.steps.length + " 步。");
    }
    refreshScoreClasses();
    scrollScoreToCurrent();
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
    state.got = {};
    state.finished = false;
    if (!state.melody.steps.length) {
      setStatus("自由弹奏模式：没有乐谱，随便弹，享受音色就好。");
    } else if (hasChords(state.melody)) {
      setStatus("从第一步开始：高亮的就是下一步；上下两个数字表示双手要一起按（先后按下也算）。");
    } else {
      setStatus("从第一个音开始：高亮的音符就是下一个要弹的键。");
    }
    refreshScoreClasses();
    scrollScoreToCurrent();
  }

  function hasChords(melody) {
    return melody.steps.some(function (step) { return step.length > 1; });
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
  // Numbers are C-based jianpu (1 = C4)：a dot above means the higher octave, a
  // dot below the lower octave, ♯ marks a sharp; the keyboard letter to press
  // sits right under each number. Chord steps stack melody over bass in one cell.
  function jianpuOf(name) {
    var degree = { C: 1, D: 2, E: 3, F: 4, G: 5, A: 6, B: 7 }[name.charAt(0)];
    var octave = name.charAt(name.length - 1);
    return {
      num: degree,
      sharp: name.indexOf("#") !== -1,
      high: octave === "5",
      low: octave === "3"
    };
  }

  function pitchHtml(name) {
    var note = NOTE_BY_NAME[name];
    var jp = jianpuOf(name);
    return (
      '<span class="jianpu-pitch" data-note="' + name + '">' +
        '<span class="jianpu-dot' + (jp.high ? " is-on" : "") + '"></span>' +
        '<span class="jianpu-num">' + (jp.sharp ? "♯" : "") + jp.num + "</span>" +
        '<span class="jianpu-dot jianpu-dot-low' + (jp.low ? " is-on" : "") + '"></span>' +
        '<span class="jianpu-key">' + note.key + "</span>" +
      "</span>"
    );
  }

  function renderScore() {
    var wrap = $("play-score");
    if (!wrap) { return; }
    var melody = state.melody;
    if (!melody.steps.length) {
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
      parts.push(
        '<span class="jianpu-note score-note" data-idx="' + idx + '">' +
          tok.split("+").map(pitchHtml).join("") +
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
      Array.prototype.forEach.call(g.querySelectorAll(".jianpu-pitch"), function (p) {
        p.classList.toggle("is-got", i === state.pos && !!state.got[p.getAttribute("data-note")]);
      });
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
          '<span class="piano-notename">' + n.name + "</span>" +
        "</button>"
      );
    });

    var blackWidth = whiteWidth * 0.62;
    NOTES.forEach(function (n) {
      if (!n.black) { return; }
      // A black key sits on the boundary after the white key one semitone below.
      var whiteIdx = 0;
      for (var i = 0; i < whites.length; i++) {
        if (whites[i].semitone < n.semitone) { whiteIdx = i; }
      }
      var left = (whiteIdx + 1) * whiteWidth - blackWidth / 2;
      parts.push(
        '<button type="button" class="piano-key piano-black" style="left:' + left.toFixed(3) + "%;width:" + blackWidth.toFixed(3) + '%" data-note="' + n.name + '" aria-label="' + n.name + '">' +
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
      var key = (e.key || "").toLowerCase();
      if (key === "-" || key === "_") {
        e.preventDefault();
        setOctave(state.octave - 1);
        return;
      }
      if (key === "=" || key === "+") {
        e.preventDefault();
        setOctave(state.octave + 1);
        return;
      }
      var name = KEY_TO_NOTE[key];
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

    // Group melodies into <optgroup>s (古典与歌剧 / 电影配乐 / ungrouped at the end).
    var groupOrder = [];
    var byGroup = {};
    MELODIES.forEach(function (m) {
      var g = m.group || "";
      if (!byGroup[g]) { byGroup[g] = []; groupOrder.push(g); }
      byGroup[g].push(m);
    });
    melodySel.innerHTML = groupOrder.map(function (g) {
      var opts = byGroup[g].map(function (m) {
        return '<option value="' + m.id + '">' + m.title + "</option>";
      }).join("");
      return g ? '<optgroup label="' + g + '">' + opts + "</optgroup>" : opts;
    }).join("");
    timbreSel.innerHTML = Object.keys(TIMBRES).map(function (id) {
      return '<option value="' + id + '">' + TIMBRES[id].label + "</option>";
    }).join("");

    melodySel.addEventListener("change", function () {
      for (var i = 0; i < MELODIES.length; i++) {
        if (MELODIES[i].id === melodySel.value) { state.melody = MELODIES[i]; }
      }
      // A shifted keyboard would contradict the printed keycaps, so scores
      // always start from the home position; free play keeps the shift.
      if (state.melody.steps.length) { setOctave(0); }
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

    var octDown = $("play-octave-down");
    var octUp = $("play-octave-up");
    if (octDown) {
      octDown.addEventListener("click", function () { setOctave(state.octave - 1); octDown.blur(); });
    }
    if (octUp) {
      octUp.addEventListener("click", function () { setOctave(state.octave + 1); octUp.blur(); });
    }
    setOctave(0);
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
