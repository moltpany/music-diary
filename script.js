(function () {
  "use strict";

  var THEME_STORAGE_KEY = "music-diary-theme";
  var LANG_STORAGE_KEY = "music-diary-lang";

  function getStoredLang() {
    try {
      var l = window.localStorage && window.localStorage.getItem(LANG_STORAGE_KEY);
      if (l === "en" || l === "zh") { return l; }
    } catch (e) {}
    return "zh";
  }

  var DATA = (typeof window !== "undefined" && window.MUSIC_DIARY_DATA) || { collections: [], entries: [] };
  var COLLECTIONS = Array.isArray(DATA.collections) ? DATA.collections : [];
  var ENTRIES = Array.isArray(DATA.entries) ? DATA.entries : [];

  // Original dataset index per entry — used to keep concert/program order.
  var ENTRY_INDEX = {};
  ENTRIES.forEach(function (e, i) { ENTRY_INDEX[e.id] = i; });

  var state = {
    filtered: ENTRIES.slice(),
    selectedId: null,
    lang: getStoredLang(),
    map: null,
    markers: {},
    markerByEntry: {}
  };

  // ---- i18n ---------------------------------------------------------------
  // Dynamic strings built in JS. {n}/{total}/{v}/{t}/{label} are interpolated.
  var STRINGS = {
    zh: {
      popupWorks: "{n} 首作品", collCount: "{n} 首",
      noMatchTitle: "没有匹配的作品", adjustFilters: "请调整筛选条件。",
      noResults: "当前筛选没有结果。", emptyNote: "没有匹配的作品，试试放宽筛选条件。",
      cityCountrySep: "，", certainty: "（地点确定度：{v}）",
      placeSource: "地点来源：{label} ↗", listen: "试听：{t}", quoteSource: "出处：{label} ↗",
      view: "查看", inPlaylists: "收录于：",
      allPlaylists: "全部歌单", allComposers: "全部作曲家",
      resultCount: "共 {n} / {total} 首",
      themeLight: "白天", themeDark: "黑夜",
      switchToLight: "切换到白天模式", switchToDark: "切换到黑夜模式",
      langLabel: "EN", langAria: "Switch to English", certHigh: "高", certMid: "中", certLow: "低"
    },
    en: {
      popupWorks: "{n} works", collCount: "{n} pieces",
      noMatchTitle: "No matching work", adjustFilters: "Try adjusting the filters.",
      noResults: "No results for the current filters.", emptyNote: "No matching works — try loosening the filters.",
      cityCountrySep: ", ", certainty: " (location certainty: {v})",
      placeSource: "Location source: {label} ↗", listen: "Listen: {t}", quoteSource: "Source: {label} ↗",
      view: "view", inPlaylists: "In playlists: ",
      allPlaylists: "All playlists", allComposers: "All composers",
      resultCount: "{n} / {total} works",
      themeLight: "Light", themeDark: "Dark",
      switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode",
      langLabel: "中", langAria: "切换到中文", certHigh: "High", certMid: "Medium", certLow: "Low"
    }
  };

  // English overrides for static HTML, keyed by data-i18n* attribute values.
  var STATIC_EN = {
    "nav.explore": "Explore", "nav.collections": "Playlists", "nav.concerts": "Concerts",
    "nav.play": "Play one", "nav.detail": "Work detail", "nav.sources": "Sources",
    "play.kicker": "Mini-game", "play.title": "Follow the score, play one on your keyboard",
    "play.intro": 'The scores are all drawn from works collected in this diary\'s playlists, written in <strong>jianpu</strong> (numbered notation: 1 = C, a dot above a number means an octave up, a dot below an octave down, ♯ is a semitone); under each number is the key to press. The layout supports <strong>two hands</strong>: the right-hand white keys are Q W E R T Y U I O P [ with black keys on the number row (2 3 5 6 7 9 0), and the left-hand bass white keys are Z X C V B N M with black keys S D G H J. In two-hand scores the upper and lower numbers in one slot are pressed together (one after the other counts too); you can also just click the keys below. Finish a whole piece for a little surprise — more playlist melodies will be added over time. (The mini-game\'s notation and melody names are currently shown in Chinese only.)',
    "play.labelMelody": "Score", "play.labelTimbre": "Timbre", "play.restart": "Restart",
    "play.hint": "Timbres are synthesized live in the browser with Web Audio — no audio files to download; on a phone you can tap the keys directly.",
    "hero.eyebrow": "Music Diary · maintained by Boya",
    "hero.copy": 'A music diary — from the classical canon to film scores. Organized by theme into <strong><a href="#collections">playlists</a></strong> (Love, Night &amp; Moonlight, Solo Piano, Opera Stage, Longing &amp; Farewell, Before Sleep), and by whole performance into <strong><a href="#concerts">concerts</a></strong> (John Williams\' Berlin film night, the Vienna Philharmonic live). Click a marker on the <strong>map</strong> to pop up a work and jump to its detail; every piece comes with its background, meaning, a note from the composer, and listening links.',
    "hero.sub": 'Sister project: <a href="https://moltpany.github.io/mozart-journey/">Mozart Journey</a> — a map of Mozart\'s footsteps alone.',
    "explore.kicker": "Map", "explore.title": "Open a work on the map",
    "filter.search": "Search", "filter.collection": "Playlist", "filter.composer": "Composer",
    "filter.searchPh": "Chopin / nocturne / Vienna / opera",
    "map.hint": "The number on each round marker is that city's work count; works from the same city gather into one marker — open it to pick one.",
    "map.warning": "The map tiles need a network connection to load; the playlists below still work and link through.",
    "detail.kicker": "Work detail", "detail.title": "Select a work",
    "detail.metaDefault": "Use the “View work detail” button in a map popup, or any piece in a playlist, and its background and official sources show here.",
    "detail.bgHead": "Background", "detail.bgDefault": "Select a work from the map or a playlist and its background shows here.",
    "detail.meaningHead": "Meaning", "detail.meaningDefault": "Select a work from the map or a playlist and its meaning shows here.",
    "detail.quoteLabel": "A note from the composer", "detail.sourcesHead": "Sources",
    "detail.mapLink": "Show on the map",
    "collections.kicker": "Playlists & collections", "collections.title": "Works, organized into collections",
    "collections.intro": "A work can belong to several playlists at once (Le Cygne, for instance, is in Love as well as Night &amp; Moonlight and Longing &amp; Farewell). Click any piece to jump to its detail.",
    "concerts.kicker": "Concerts", "concerts.title": "Organized by a single performance",
    "concerts.intro": "Complete concert programs, in the order they were played that night. Click any piece to jump to its detail.",
    "sources.kicker": "About the sources", "sources.title": "On sourcing and stance",
    "sources.body": 'This project follows the same stance as Mozart Journey: no invented dates, places or backstories, and cautious wording for uncertain history. Sources favor <strong>official composer portals and research institutions</strong> (Beethoven-Haus Bonn, Schumann-Portal, the Fryderyk Chopin Institute / NIFC, Brahms-Portal, the Mahler Foundation, Palazzetto Bru Zane, the Puccini study center, the Mozarteum Köchel catalogue, and so on); for the few works without an official per-piece page, the authoritative score archive IMSLP is used. Each work’s specific sources appear in its <a href="#detail">work detail</a>. Data lives in <code>data/music-diary.json</code>.',
    "footer.line1": 'A work by Boya · static site · Leaflet + OpenStreetMap · data in <code>data/music-diary.json</code>',
    "footer.line2": 'Sister project: <a href="https://moltpany.github.io/mozart-journey/">Mozart Journey</a> · back to <a href="https://moltpany.github.io/">Moltpany</a>'
  };

  function t(key, vars) {
    var s = (STRINGS[state.lang] && STRINGS[state.lang][key]) || (STRINGS.zh[key] || key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace("{" + k + "}", vars[k]);
      });
    }
    return s;
  }

  function localizeCertainty(v) {
    if (v === "高") { return t("certHigh"); }
    if (v === "中") { return t("certMid"); }
    if (v === "低") { return t("certLow"); }
    return v;
  }

  // Localized scalar field with zh fallback: loc(obj, "title").
  function loc(obj, field) {
    if (state.lang === "en" && obj && obj.en && obj.en[field] != null && obj.en[field] !== "") {
      return obj.en[field];
    }
    return obj ? obj[field] : undefined;
  }

  // Localized nested field with zh fallback: locIn(entry, "place", "name").
  function locIn(obj, sub, field) {
    if (state.lang === "en" && obj && obj.en && obj.en[sub] && obj.en[sub][field] != null && obj.en[sub][field] !== "") {
      return obj.en[sub][field];
    }
    return obj && obj[sub] ? obj[sub][field] : undefined;
  }

  // Sources for display: in EN mode, drop summaries that have no English yet
  // (label + link stay) so detail pages don't show stray Chinese prose.
  function getLocalizedSources(entry) {
    return getEntrySources(entry).map(function (s) {
      if (state.lang === "en") {
        var enSummary = s.en && s.en.summary ? s.en.summary : "";
        return { label: s.en && s.en.label ? s.en.label : s.label, url: s.url, summary: enSummary };
      }
      return s;
    });
  }

  function coordKey(entry) {
    return entry.lat + "," + entry.lng;
  }

  // ---- Helpers ------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  function setText(id, text) {
    var el = $(id);
    if (el) { el.textContent = text; }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function byYearThenCity(a, b) {
    return (a.year - b.year) || String(a.city).localeCompare(String(b.city));
  }

  function getEntry(id) {
    for (var i = 0; i < ENTRIES.length; i++) {
      if (ENTRIES[i].id === id) { return ENTRIES[i]; }
    }
    return null;
  }

  function getEntryCollections(entry) {
    if (!entry || !Array.isArray(entry.collections)) { return []; }
    return COLLECTIONS.filter(function (c) { return entry.collections.indexOf(c.id) !== -1; });
  }

  function getEntrySources(entry) {
    if (!entry) { return []; }
    if (Array.isArray(entry.sources) && entry.sources.length) { return entry.sources; }
    return entry.source ? [entry.source] : [];
  }

  function buildListeningLinks(listening) {
    if (!listening || !listening.query) { return []; }
    var q = encodeURIComponent(listening.query);
    return [
      { label: "YouTube", url: "https://www.youtube.com/results?search_query=" + q },
      { label: "Bilibili", url: "https://search.bilibili.com/all?keyword=" + q },
      { label: "Spotify", url: "https://open.spotify.com/search/" + q },
      { label: "Apple Music", url: "https://music.apple.com/search?term=" + q }
    ];
  }

  // ---- Filtering ----------------------------------------------------------
  function currentFilters() {
    return {
      query: (($("search-filter") && $("search-filter").value) || "").trim().toLowerCase(),
      collection: ($("collection-filter") && $("collection-filter").value) || "all",
      composer: ($("composer-filter") && $("composer-filter").value) || "all"
    };
  }

  function matchesFilters(entry, filters) {
    if (filters.collection !== "all") {
      if (!Array.isArray(entry.collections) || entry.collections.indexOf(filters.collection) === -1) { return false; }
    }
    if (filters.composer !== "all" && entry.composer !== filters.composer) { return false; }
    if (filters.query) {
      var parts = [entry.title, entry.work, entry.composer, entry.city, entry.country, entry.blurb, entry.mood, String(entry.year)];
      if (entry.en) {
        parts = parts.concat([entry.en.title, entry.en.work, entry.en.composer, entry.en.blurb, entry.en.mood]);
      }
      var hay = parts.filter(Boolean).join(" ").toLowerCase();
      if (hay.indexOf(filters.query) === -1) { return false; }
    }
    return true;
  }

  // ---- Filter UI ----------------------------------------------------------
  // zh composer string -> en composer, for localized option labels.
  var COMPOSER_EN = {};
  ENTRIES.forEach(function (e) {
    if (e.en && e.en.composer) { COMPOSER_EN[e.composer] = e.en.composer; }
  });

  function buildFilterOptions() {
    var collFilter = $("collection-filter");
    var compFilter = $("composer-filter");
    var prevColl = collFilter ? collFilter.value : "all";
    var prevComp = compFilter ? compFilter.value : "all";

    var collOpts = ['<option value="all">' + escapeHtml(t("allPlaylists")) + "</option>"];
    COLLECTIONS.forEach(function (c) {
      collOpts.push('<option value="' + escapeHtml(c.id) + '">' + escapeHtml(loc(c, "title")) + "</option>");
    });
    if (collFilter) { collFilter.innerHTML = collOpts.join(""); collFilter.value = prevColl || "all"; }

    var composers = [];
    ENTRIES.forEach(function (e) { if (composers.indexOf(e.composer) === -1) { composers.push(e.composer); } });
    composers.sort();
    var compOpts = ['<option value="all">' + escapeHtml(t("allComposers")) + "</option>"];
    composers.forEach(function (c) {
      var label = (state.lang === "en" && COMPOSER_EN[c]) ? COMPOSER_EN[c] : c;
      compOpts.push('<option value="' + escapeHtml(c) + '">' + escapeHtml(label) + "</option>");
    });
    if (compFilter) { compFilter.innerHTML = compOpts.join(""); compFilter.value = prevComp || "all"; }
  }

  function populateFilters() {
    buildFilterOptions();
    ["search-filter", "collection-filter", "composer-filter"].forEach(function (id) {
      var el = $(id);
      if (!el) { return; }
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });
  }

  // ---- Map ----------------------------------------------------------------
  function initMap() {
    if (typeof L === "undefined") {
      $("map-warning").hidden = false;
      return;
    }
    state.map = L.map("map", { scrollWheelZoom: true, worldCopyJump: true }).setView([48.5, 9.5], 4);
    var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.on("tileerror", function () { $("map-warning").hidden = false; });
    tiles.addTo(state.map);
  }

  function cityIcon(count, isActive) {
    var cls = "city-marker" + (isActive ? " is-active" : "");
    return L.divIcon({
      className: "city-marker-wrap",
      html: '<span class="' + cls + '">' + count + "</span>",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -14]
    });
  }

  function buildCityPopup(group) {
    var head =
      '<strong class="popup-city">' + escapeHtml(group.city) + "</strong>" +
      '<span class="popup-meta">' + escapeHtml(t("popupWorks", { n: group.entries.length })) + "</span>";
    var items = group.entries.map(function (entry) {
      var venue = locIn(entry, "place", "name") || "";
      return (
        '<button type="button" class="popup-item" data-id="' + escapeHtml(entry.id) + '">' +
          '<span class="popup-item-title">' + escapeHtml(loc(entry, "title")) + "</span>" +
          '<span class="popup-item-sub">' + escapeHtml(loc(entry, "composer") + " · " + entry.year) + "</span>" +
          (venue ? '<span class="popup-item-venue">📍 ' + escapeHtml(venue) + "</span>" : "") +
        "</button>"
      );
    }).join("");
    return '<div class="popup-city-card">' + head + '<div class="popup-items">' + items + "</div></div>";
  }

  function renderMarkers(entries) {
    if (!state.map) { return; }
    state.map.closePopup();
    Object.keys(state.markers).forEach(function (key) {
      state.map.removeLayer(state.markers[key]);
    });
    state.markers = {};
    state.markerByEntry = {};

    // Group entries that share the same coordinates into one city marker.
    var groups = {};
    var order = [];
    entries.forEach(function (entry) {
      if (typeof entry.lat !== "number" || typeof entry.lng !== "number") { return; }
      var key = coordKey(entry);
      if (!groups[key]) {
        groups[key] = { key: key, lat: entry.lat, lng: entry.lng, city: entry.city, entries: [] };
        order.push(key);
      }
      groups[key].entries.push(entry);
    });

    // Within each marker, list works in dataset order (= concert order for the
    // Berlin Film Night) so a venue popup reads top-to-bottom as the program.
    order.forEach(function (key) {
      groups[key].entries.sort(function (a, b) {
        return ENTRY_INDEX[a.id] - ENTRY_INDEX[b.id];
      });
    });

    order.forEach(function (key) {
      var group = groups[key];
      var marker = L.marker([group.lat, group.lng], {
        icon: cityIcon(group.entries.length, false),
        title: group.city
      }).addTo(state.map);
      marker.bindPopup(buildCityPopup(group), { minWidth: 200 });
      marker.cityGroup = group;
      marker.on("popupopen", function () {
        var popupEl = marker.getPopup() && marker.getPopup().getElement ? marker.getPopup().getElement() : null;
        if (!popupEl) { return; }
        Array.prototype.forEach.call(popupEl.querySelectorAll(".popup-item"), function (btn) {
          btn.addEventListener("click", function () {
            selectEntry(btn.getAttribute("data-id"), { scrollDetail: true });
          });
        });
      });
      state.markers[key] = marker;
      group.entries.forEach(function (entry) { state.markerByEntry[entry.id] = marker; });
    });

    if (order.length > 1) {
      state.map.fitBounds(L.latLngBounds(order.map(function (k) { return [groups[k].lat, groups[k].lng]; })), { padding: [36, 36] });
    } else if (order.length === 1) {
      state.map.setView([groups[order[0]].lat, groups[order[0]].lng], 6);
    }
    refreshMarkerHighlight();
  }

  function refreshMarkerHighlight() {
    var activeMarker = state.selectedId ? state.markerByEntry[state.selectedId] : null;
    Object.keys(state.markers).forEach(function (key) {
      var marker = state.markers[key];
      var isActive = marker === activeMarker;
      marker.setIcon(cityIcon(marker.cityGroup.entries.length, isActive));
    });
  }

  function focusEntryOnMap(entry, scrollToMap) {
    if (!state.map || typeof entry.lat !== "number") { return; }
    var marker = state.markerByEntry[entry.id];
    if (scrollToMap) {
      var mapEl = $("map");
      if (mapEl && mapEl.scrollIntoView) { mapEl.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }
    // Close any stale popup first so the next open re-fires popupopen (re-binding
    // the list's click handlers) and is positioned for the final map view.
    state.map.closePopup();
    state.map.setView([entry.lat, entry.lng], Math.max(state.map.getZoom(), 6), { animate: true });
    if (!marker) { return; }
    // Open the popup once the view settles, otherwise autoPan can mis-place it
    // (and leave the list unclickable) when the map was off-screen / mid-animation.
    var opened = false;
    var open = function () {
      if (opened) { return; }
      opened = true;
      marker.openPopup();
    };
    state.map.once("moveend", open);
    // Fallback: if the view doesn't actually move, moveend never fires.
    setTimeout(open, 400);
  }

  // ---- Collections (歌单) -------------------------------------------------
  function getCollectionGroups(entries) {
    return COLLECTIONS.map(function (collection) {
      var picked = entries.filter(function (e) {
        return Array.isArray(e.collections) && e.collections.indexOf(collection.id) !== -1;
      });
      // collections marked order:"asis" follow the dataset order (e.g. a concert
      // program); others sort by year. We sort by ENTRY_INDEX rather than relying
      // on the incoming array, which arrives already year-sorted from applyFilters.
      if (collection.order === "asis") {
        picked = picked.sort(function (a, b) { return ENTRY_INDEX[a.id] - ENTRY_INDEX[b.id]; });
      } else {
        picked = picked.sort(byYearThenCity);
      }
      return { collection: collection, entries: picked };
    }).filter(function (group) { return group.entries.length > 0; });
  }

  function renderCollections(entries) {
    var allGroups = getCollectionGroups(entries);
    renderCollectionGroups(
      allGroups.filter(function (g) { return (g.collection.kind || "playlist") !== "concert"; }),
      "collection-section-nav", "collection-section-list"
    );
    renderCollectionGroups(
      allGroups.filter(function (g) { return g.collection.kind === "concert"; }),
      "concert-section-nav", "concert-section-list"
    );
    highlightSelected();
  }

  function renderCollectionGroups(groups, navId, listId) {
    var nav = $(navId);
    var list = $(listId);
    if (!list) { return; }

    if (nav) {
      nav.innerHTML = groups.map(function (g) {
        return '<a href="#collection-' + escapeHtml(g.collection.id) + '">' +
          escapeHtml(loc(g.collection, "title")) + " (" + g.entries.length + ")</a>";
      }).join("");
    }

    list.innerHTML = groups.map(function (g) {
      var items = g.entries.map(function (entry) {
        return (
          '<button type="button" class="collection-item" data-id="' + escapeHtml(entry.id) + '" aria-pressed="false">' +
            "<strong>" + escapeHtml(loc(entry, "title")) + "</strong>" +
            "<span>" + escapeHtml(loc(entry, "composer")) + "</span>" +
            "<small>" + escapeHtml(entry.year + " · " + entry.city) + "</small>" +
          "</button>"
        );
      }).join("");
      var badgeVal = loc(g.collection, "badge");
      var badge = badgeVal
        ? ' <span class="collection-badge">' + escapeHtml(badgeVal) + "</span>"
        : "";
      var introVal = loc(g.collection, "intro");
      var intro = introVal
        ? '<p class="collection-intro-note">' + escapeHtml(introVal) + "</p>"
        : "";
      return (
        '<article class="collection-card" id="collection-' + escapeHtml(g.collection.id) + '">' +
          '<div class="collection-card-head">' +
            "<h3>" + escapeHtml(loc(g.collection, "title")) + badge +
              ' <span class="collection-count">' + escapeHtml(t("collCount", { n: g.entries.length })) + "</span></h3>" +
            "<p>" + escapeHtml(loc(g.collection, "description")) + "</p>" +
            intro +
          "</div>" +
          '<div class="collection-items">' + items + "</div>" +
        "</article>"
      );
    }).join("") || '<p class="empty-note">' + escapeHtml(t("emptyNote")) + "</p>";

    Array.prototype.forEach.call(list.querySelectorAll(".collection-item"), function (btn) {
      btn.addEventListener("click", function () {
        selectEntry(btn.getAttribute("data-id"), { focusMap: true, scrollDetail: true });
      });
    });
  }

  function highlightSelected() {
    Array.prototype.forEach.call(document.querySelectorAll(".collection-item"), function (item) {
      var selected = item.getAttribute("data-id") === state.selectedId;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  // ---- Detail -------------------------------------------------------------
  function renderDetail(entry) {
    if (!entry) {
      setText("detail-title", t("noMatchTitle"));
      setText("detail-meta", t("adjustFilters"));
      setText("detail-lead", "");
      setText("detail-background", t("noResults"));
      setText("detail-meaning", t("noResults"));
      $("detail-collections").hidden = true;
      $("detail-listening").hidden = true;
      $("detail-quote").hidden = true;
      $("detail-sources").hidden = true;
      $("detail-map-link").hidden = true;
      return;
    }

    setText("detail-title", loc(entry, "title"));
    var meta = loc(entry, "composer") + " · " + loc(entry, "work") + " · " + entry.year + " · " + entry.city + t("cityCountrySep") + entry.country;
    var moodVal = loc(entry, "mood");
    if (moodVal) { meta += " · " + moodVal; }
    setText("detail-meta", meta);
    setText("detail-lead", loc(entry, "blurb") || "");
    setText("detail-background", loc(entry, "background") || loc(entry, "blurb") || "");
    setText("detail-meaning", loc(entry, "meaning") || "");

    var collContainer = $("detail-collections");
    var collections = getEntryCollections(entry);
    if (collections.length) {
      collContainer.innerHTML = '<span class="detail-collections-label">' + escapeHtml(t("inPlaylists")) + "</span>" +
        collections.map(function (c) {
          return '<a class="detail-collection-link" href="#collection-' + escapeHtml(c.id) + '">' + escapeHtml(loc(c, "title")) + "</a>";
        }).join("");
      collContainer.hidden = false;
    } else {
      collContainer.hidden = true;
    }

    var placeBox = $("detail-place");
    if (entry.place && entry.place.name) {
      var pName = locIn(entry, "place", "name");
      var pCert = entry.place.certainty;
      setText("detail-place-name", pName + (pCert ? t("certainty", { v: localizeCertainty(pCert) }) : ""));
      setText("detail-place-address", locIn(entry, "place", "address") || "");
      setText("detail-place-note", locIn(entry, "place", "note") || "");
      var ps = $("detail-place-source");
      if (entry.place.source && entry.place.source.url) {
        ps.href = entry.place.source.url;
        ps.textContent = t("placeSource", { label: entry.place.source.label || t("view") });
        ps.hidden = false;
      } else {
        ps.hidden = true;
      }
      placeBox.hidden = false;
    } else {
      placeBox.hidden = true;
    }

    var links = buildListeningLinks(entry.listening);
    if (links.length) {
      setText("detail-listening-target", t("listen", { t: (entry.listening && entry.listening.target) || loc(entry, "title") }));
      $("detail-listening-links").innerHTML = links.map(function (l) {
        return '<a href="' + l.url + '" target="_blank" rel="noreferrer">' + l.label + "</a>";
      }).join("");
      $("detail-listening").hidden = false;
    } else {
      $("detail-listening").hidden = true;
    }

    var quoteBox = $("detail-quote");
    var quoteText = locIn(entry, "quote", "text");
    if (entry.quote && quoteText) {
      setText("detail-quote-text", quoteText);
      var qs = $("detail-quote-source");
      if (entry.quote.source && entry.quote.source.url) {
        qs.href = entry.quote.source.url;
        qs.textContent = t("quoteSource", { label: entry.quote.source.label || t("view") });
        qs.hidden = false;
      } else {
        qs.hidden = true;
      }
      quoteBox.hidden = false;
    } else {
      quoteBox.hidden = true;
    }

    var sources = getLocalizedSources(entry);
    var sourcesBox = $("detail-sources");
    if (sources.length) {
      $("detail-sources-list").innerHTML = sources.map(function (s) {
        return (
          '<div class="detail-source-item">' +
            '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(s.label || s.url) + " ↗</a>" +
            (s.summary ? "<p>" + escapeHtml(s.summary) + "</p>" : "") +
          "</div>"
        );
      }).join("");
      sourcesBox.hidden = false;
    } else {
      sourcesBox.hidden = true;
    }

    $("detail-map-link").hidden = !(typeof entry.lat === "number" && typeof entry.lng === "number");
  }

  function selectEntry(id, opts) {
    opts = opts || {};
    var entry = getEntry(id);
    if (!entry) { return; }
    state.selectedId = entry.id;
    renderDetail(entry);
    highlightSelected();
    refreshMarkerHighlight();

    if (opts.focusMap) { focusEntryOnMap(entry, false); }
    if (opts.scrollDetail) {
      var detail = $("detail");
      if (detail && detail.scrollIntoView) { detail.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }
  }

  // Exposed so the play-along game (keyboard-game.js) can open a work's detail.
  if (typeof window !== "undefined") {
    window.musicDiarySelectEntry = selectEntry;
  }

  // ---- Theme toggle -------------------------------------------------------
  function refreshThemeButton() {
    var btn = $("theme-toggle");
    if (!btn) { return; }
    var isDark = document.documentElement.dataset.theme === "dark";
    btn.textContent = isDark ? t("themeLight") : t("themeDark");
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute("aria-label", isDark ? t("switchToLight") : t("switchToDark"));
  }

  function initTheme() {
    var btn = $("theme-toggle");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      refreshThemeButton();
      try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (e) {}
    });
  }

  // ---- Language toggle ----------------------------------------------------
  function applyStaticI18n() {
    var en = state.lang === "en";
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      if (el.dataset.zhText == null) { el.dataset.zhText = el.textContent; }
      el.textContent = en ? (STATIC_EN[el.getAttribute("data-i18n")] || el.dataset.zhText) : el.dataset.zhText;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-html]"), function (el) {
      if (el.dataset.zhHtml == null) { el.dataset.zhHtml = el.innerHTML; }
      el.innerHTML = en ? (STATIC_EN[el.getAttribute("data-i18n-html")] || el.dataset.zhHtml) : el.dataset.zhHtml;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-ph]"), function (el) {
      if (el.dataset.zhPh == null) { el.dataset.zhPh = el.getAttribute("placeholder") || ""; }
      el.setAttribute("placeholder", en ? (STATIC_EN[el.getAttribute("data-i18n-ph")] || el.dataset.zhPh) : el.dataset.zhPh);
    });
  }

  function refreshLangButton() {
    var btn = $("lang-toggle");
    if (!btn) { return; }
    btn.textContent = t("langLabel");
    btn.setAttribute("aria-label", t("langAria"));
  }

  function applyLang() {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    applyStaticI18n();
    refreshThemeButton();
    refreshLangButton();
    buildFilterOptions();
    applyFilters();
    renderDetail(getEntry(state.selectedId));
    highlightSelected();
  }

  function initLang() {
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    applyStaticI18n();
    refreshLangButton();
    var btn = $("lang-toggle");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      state.lang = state.lang === "en" ? "zh" : "en";
      try { localStorage.setItem(LANG_STORAGE_KEY, state.lang); } catch (e) {}
      applyLang();
    });
  }

  // ---- Detail map-link button --------------------------------------------
  function initDetailActions() {
    var mapLink = $("detail-map-link");
    if (!mapLink) { return; }
    mapLink.addEventListener("click", function () {
      var entry = getEntry(state.selectedId);
      if (entry) { focusEntryOnMap(entry, true); }
    });
  }

  // ---- Apply filters ------------------------------------------------------
  function applyFilters() {
    var filters = currentFilters();
    state.filtered = ENTRIES.filter(function (e) { return matchesFilters(e, filters); }).sort(byYearThenCity);
    setText("result-count", t("resultCount", { n: state.filtered.length, total: ENTRIES.length }));
    renderMarkers(state.filtered);
    renderCollections(state.filtered);

    var stillVisible = state.filtered.some(function (e) { return e.id === state.selectedId; });
    if (!stillVisible) {
      var fallback = state.filtered[0] || null;
      state.selectedId = fallback ? fallback.id : null;
      renderDetail(fallback);
      highlightSelected();
    }
  }

  // ---- Init ---------------------------------------------------------------
  function init() {
    initTheme();
    initLang();
    refreshThemeButton();
    populateFilters();
    initMap();
    initDetailActions();
    applyFilters();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
