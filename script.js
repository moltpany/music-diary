"use strict";

(function () {
  // ---- Data ---------------------------------------------------------------
  var DATA = (typeof window !== "undefined" && window.MUSIC_DIARY_DATA) || { themes: [], entries: [] };
  var THEMES = Array.isArray(DATA.themes) ? DATA.themes : [];
  var ENTRIES = Array.isArray(DATA.entries) ? DATA.entries : [];

  var themeById = {};
  THEMES.forEach(function (t) { themeById[t.id] = t; });

  // ---- DOM ----------------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var mapViewBtn = $("view-map");
  var themeViewBtn = $("view-theme");
  var mapView = $("map-view");
  var themeView = $("theme-view");
  var themeGroups = $("theme-groups");
  var searchFilter = $("search-filter");
  var themeFilter = $("theme-filter");
  var composerFilter = $("composer-filter");
  var resultCount = $("result-count");
  var sourceList = $("source-list");

  var detail = {
    title: $("detail-title"),
    meta: $("detail-meta"),
    themes: $("detail-themes"),
    listening: $("detail-listening"),
    listeningTarget: $("detail-listening-target"),
    listeningLinks: $("detail-listening-links"),
    blurb: $("detail-blurb"),
    mapLink: $("detail-map-link"),
    source: $("detail-source")
  };

  var selectedId = null;
  var markers = {};
  var map = null;

  // ---- Helpers ------------------------------------------------------------
  function composerName(entry) {
    // "肖邦 (Frédéric Chopin)" -> keep full label for display, short for grouping
    return entry.composer || "";
  }

  function buildListeningLinks(listening) {
    if (!listening || !listening.query) return [];
    var q = encodeURIComponent(listening.query);
    return [
      { label: "YouTube", url: "https://www.youtube.com/results?search_query=" + q },
      { label: "Bilibili", url: "https://search.bilibili.com/all?keyword=" + q },
      { label: "Spotify", url: "https://open.spotify.com/search/" + q },
      { label: "Apple Music", url: "https://music.apple.com/search?term=" + q }
    ];
  }

  function matchesFilters(entry) {
    var term = (searchFilter.value || "").trim().toLowerCase();
    var theme = themeFilter.value;
    var composer = composerFilter.value;

    if (theme && theme !== "all") {
      if (!Array.isArray(entry.themes) || entry.themes.indexOf(theme) === -1) return false;
    }
    if (composer && composer !== "all" && entry.composer !== composer) return false;
    if (term) {
      var hay = [
        entry.title, entry.work, entry.composer, entry.city, entry.country,
        entry.blurb, String(entry.year)
      ].join(" ").toLowerCase();
      if (hay.indexOf(term) === -1) return false;
    }
    return true;
  }

  function visibleEntries() {
    return ENTRIES.filter(matchesFilters);
  }

  // ---- Filters UI ---------------------------------------------------------
  function populateFilters() {
    var themeOpts = ['<option value="all">全部主题</option>'];
    THEMES.forEach(function (t) {
      themeOpts.push('<option value="' + t.id + '">' + t.name + '</option>');
    });
    themeFilter.innerHTML = themeOpts.join("");

    var composers = [];
    ENTRIES.forEach(function (e) {
      if (composers.indexOf(e.composer) === -1) composers.push(e.composer);
    });
    composers.sort();
    var compOpts = ['<option value="all">全部作曲家</option>'];
    composers.forEach(function (c) {
      compOpts.push('<option value="' + c + '">' + c + '</option>');
    });
    composerFilter.innerHTML = compOpts.join("");
  }

  // ---- Map ----------------------------------------------------------------
  function initMap() {
    if (typeof L === "undefined") {
      $("map-warning").hidden = false;
      return;
    }
    map = L.map("map", { scrollWheelZoom: false }).setView([48.5, 9.5], 4);
    var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.on("tileerror", function () { $("map-warning").hidden = false; });
    tiles.addTo(map);

    ENTRIES.forEach(function (entry) {
      if (typeof entry.lat !== "number" || typeof entry.lng !== "number") return;
      var marker = L.marker([entry.lat, entry.lng]);
      marker.bindTooltip(entry.title + " · " + entry.city, { direction: "top" });
      marker.on("click", function () { selectEntry(entry.id, { fromMap: true }); });
      markers[entry.id] = marker;
      marker.addTo(map);
    });
  }

  function refreshMapMarkers() {
    if (!map) return;
    var vis = {};
    visibleEntries().forEach(function (e) { vis[e.id] = true; });
    ENTRIES.forEach(function (e) {
      var m = markers[e.id];
      if (!m) return;
      if (vis[e.id]) {
        if (!map.hasLayer(m)) m.addTo(map);
      } else if (map.hasLayer(m)) {
        map.removeLayer(m);
      }
    });
  }

  // ---- Theme view ---------------------------------------------------------
  function renderThemeView() {
    var vis = visibleEntries();
    var byTheme = {};
    THEMES.forEach(function (t) { byTheme[t.id] = []; });
    vis.forEach(function (e) {
      (e.themes || []).forEach(function (tid) {
        if (byTheme[tid]) byTheme[tid].push(e);
      });
    });

    var html = [];
    THEMES.forEach(function (t) {
      var list = byTheme[t.id];
      if (!list || !list.length) return;
      html.push('<section class="theme-group">');
      html.push('<header class="theme-group-head">');
      html.push('<h3>' + t.name + '</h3>');
      if (t.tagline) html.push('<p class="theme-tagline">' + t.tagline + '</p>');
      if (t.blurb) html.push('<p class="theme-blurb">' + t.blurb + '</p>');
      html.push('</header>');
      html.push('<div class="card-grid">');
      list.forEach(function (e) {
        html.push(
          '<button class="work-card" type="button" data-id="' + e.id + '">' +
            '<span class="work-card-title">' + e.title + '</span>' +
            '<span class="work-card-composer">' + e.composer + '</span>' +
            '<span class="work-card-meta">' + e.year + " · " + e.city + '</span>' +
          '</button>'
        );
      });
      html.push('</div></section>');
    });
    themeGroups.innerHTML = html.join("") || '<p class="empty-note">没有匹配的作品，试试放宽筛选条件。</p>';

    Array.prototype.forEach.call(themeGroups.querySelectorAll(".work-card"), function (btn) {
      btn.addEventListener("click", function () { selectEntry(btn.getAttribute("data-id"), {}); });
    });
  }

  // ---- Detail -------------------------------------------------------------
  function selectEntry(id, opts) {
    var entry = ENTRIES.filter(function (e) { return e.id === id; })[0];
    if (!entry) return;
    selectedId = id;

    detail.title.textContent = entry.title;
    detail.meta.textContent = entry.composer + " · " + entry.work + " · " + entry.year + " · " + entry.city + "，" + entry.country;

    var themeTags = (entry.themes || []).map(function (tid) {
      var t = themeById[tid];
      return t ? '<span class="theme-tag">' + t.name + '</span>' : "";
    }).join("");
    detail.themes.innerHTML = themeTags;
    detail.themes.hidden = !themeTags;

    detail.blurb.textContent = entry.blurb || "";

    var links = buildListeningLinks(entry.listening);
    if (links.length) {
      detail.listeningTarget.textContent = (entry.listening && entry.listening.target) || entry.title;
      detail.listeningLinks.innerHTML = links.map(function (l) {
        return '<a href="' + l.url + '" target="_blank" rel="noreferrer">' + l.label + '</a>';
      }).join("");
      detail.listening.hidden = false;
    } else {
      detail.listening.hidden = true;
    }

    if (entry.source && entry.source.url) {
      detail.source.href = entry.source.url;
      detail.source.textContent = "来源：" + (entry.source.label || "查看参考来源");
      detail.source.hidden = false;
    } else {
      detail.source.hidden = true;
    }

    detail.mapLink.hidden = !(typeof entry.lat === "number" && typeof entry.lng === "number");

    if (opts && opts.fromMap && map && markers[id]) {
      markers[id].openTooltip();
    }
    if (!opts || !opts.noScroll) {
      $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  detail.mapLink.addEventListener("click", function () {
    if (!selectedId) return;
    setView("map");
    var entry = ENTRIES.filter(function (e) { return e.id === selectedId; })[0];
    if (map && entry && typeof entry.lat === "number") {
      map.setView([entry.lat, entry.lng], 6);
      if (markers[selectedId]) markers[selectedId].openTooltip();
    }
    $("explore").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---- Sources ------------------------------------------------------------
  function renderSources() {
    var rows = ENTRIES.map(function (e) {
      if (!e.source) return "";
      return (
        '<article class="source-row">' +
          '<h3>' + e.title + ' <span class="source-composer">' + e.composer + '</span></h3>' +
          '<p>' + (e.source.summary || "") + '</p>' +
          '<a href="' + e.source.url + '" target="_blank" rel="noreferrer">' + (e.source.label || e.source.url) + ' ↗</a>' +
        '</article>'
      );
    });
    sourceList.innerHTML = rows.join("");
  }

  // ---- View switching -----------------------------------------------------
  function setView(which) {
    var isMap = which === "map";
    mapView.hidden = !isMap;
    themeView.hidden = isMap;
    mapViewBtn.setAttribute("aria-selected", isMap ? "true" : "false");
    themeViewBtn.setAttribute("aria-selected", isMap ? "false" : "true");
    mapViewBtn.classList.toggle("is-active", isMap);
    themeViewBtn.classList.toggle("is-active", !isMap);
    if (isMap && map) {
      setTimeout(function () { map.invalidateSize(); }, 0);
    }
    try { localStorage.setItem("music-diary-view", which); } catch (e) {}
  }

  mapViewBtn.addEventListener("click", function () { setView("map"); });
  themeViewBtn.addEventListener("click", function () { setView("theme"); });

  // ---- Filtering refresh --------------------------------------------------
  function applyFilters() {
    var vis = visibleEntries();
    resultCount.textContent = "共 " + vis.length + " / " + ENTRIES.length + " 首";
    refreshMapMarkers();
    renderThemeView();
  }

  [searchFilter, themeFilter, composerFilter].forEach(function (el) {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  // ---- Theme (dark/light) toggle -----------------------------------------
  (function themeToggle() {
    var btn = $("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      btn.textContent = next === "dark" ? "白天" : "黑夜";
      btn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      try { localStorage.setItem("music-diary-theme", next); } catch (e) {}
    });
  })();

  // ---- Init ---------------------------------------------------------------
  populateFilters();
  initMap();
  renderSources();
  applyFilters();

  var savedView = "map";
  try { savedView = localStorage.getItem("music-diary-view") || "map"; } catch (e) {}
  setView(savedView);
})();
