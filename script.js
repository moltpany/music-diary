(function () {
  "use strict";

  var THEME_STORAGE_KEY = "music-diary-theme";

  var DATA = (typeof window !== "undefined" && window.MUSIC_DIARY_DATA) || { collections: [], entries: [] };
  var COLLECTIONS = Array.isArray(DATA.collections) ? DATA.collections : [];
  var ENTRIES = Array.isArray(DATA.entries) ? DATA.entries : [];

  var collectionById = {};
  COLLECTIONS.forEach(function (c) { collectionById[c.id] = c; });

  var state = {
    filtered: ENTRIES.slice(),
    selectedId: null,
    map: null,
    markers: {}
  };

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
      var hay = [entry.title, entry.work, entry.composer, entry.city, entry.country, entry.blurb, entry.mood, String(entry.year)]
        .join(" ").toLowerCase();
      if (hay.indexOf(filters.query) === -1) { return false; }
    }
    return true;
  }

  // ---- Filter UI ----------------------------------------------------------
  function populateFilters() {
    var collOpts = ['<option value="all">全部歌单</option>'];
    COLLECTIONS.forEach(function (c) {
      collOpts.push('<option value="' + escapeHtml(c.id) + '">' + escapeHtml(c.title) + "</option>");
    });
    $("collection-filter").innerHTML = collOpts.join("");

    var composers = [];
    ENTRIES.forEach(function (e) { if (composers.indexOf(e.composer) === -1) { composers.push(e.composer); } });
    composers.sort();
    var compOpts = ['<option value="all">全部作曲家</option>'];
    composers.forEach(function (c) {
      compOpts.push('<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>");
    });
    $("composer-filter").innerHTML = compOpts.join("");

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

  function renderMarkers(entries) {
    if (!state.map) { return; }
    state.map.closePopup();
    Object.keys(state.markers).forEach(function (id) {
      state.map.removeLayer(state.markers[id]);
    });
    state.markers = {};

    entries.forEach(function (entry) {
      if (typeof entry.lat !== "number" || typeof entry.lng !== "number") { return; }
      var marker = L.marker([entry.lat, entry.lng]).addTo(state.map);
      marker.bindPopup(
        '<strong>' + escapeHtml(entry.title) + "</strong><br>" +
        escapeHtml(entry.composer) + "<br>" +
        '<span class="popup-meta">' + escapeHtml(entry.year + " · " + entry.city) + "</span><br>" +
        '<button type="button" class="popup-detail-link" data-id="' + escapeHtml(entry.id) +
        '" aria-label="查看 ' + escapeHtml(entry.title) + ' 的作品详情">查看作品详情 →</button>'
      );
      marker.on("popupopen", function () {
        var popupEl = marker.getPopup() && marker.getPopup().getElement ? marker.getPopup().getElement() : null;
        var link = popupEl ? popupEl.querySelector(".popup-detail-link") : null;
        if (link) {
          link.addEventListener("click", function () { selectEntry(entry.id, { scrollDetail: true }); }, { once: true });
        }
      });
      state.markers[entry.id] = marker;
    });

    var coords = entries
      .filter(function (e) { return typeof e.lat === "number" && typeof e.lng === "number"; })
      .map(function (e) { return [e.lat, e.lng]; });
    if (coords.length > 1) {
      state.map.fitBounds(L.latLngBounds(coords), { padding: [36, 36] });
    } else if (coords.length === 1) {
      state.map.setView(coords[0], 6);
    }
  }

  function focusEntryOnMap(entry, scrollToMap) {
    if (scrollToMap) {
      var mapEl = $("map");
      if (mapEl && mapEl.scrollIntoView) { mapEl.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }
    if (state.map && typeof entry.lat === "number") {
      state.map.setView([entry.lat, entry.lng], Math.max(state.map.getZoom(), 6), { animate: true });
      if (state.markers[entry.id]) { state.markers[entry.id].openPopup(); }
    }
  }

  // ---- Collections (歌单) -------------------------------------------------
  function getCollectionGroups(entries) {
    return COLLECTIONS.map(function (collection) {
      return {
        collection: collection,
        entries: entries.filter(function (e) {
          return Array.isArray(e.collections) && e.collections.indexOf(collection.id) !== -1;
        }).sort(byYearThenCity)
      };
    }).filter(function (group) { return group.entries.length > 0; });
  }

  function renderCollections(entries) {
    var nav = $("collection-section-nav");
    var list = $("collection-section-list");
    if (!list) { return; }

    var groups = getCollectionGroups(entries);

    if (nav) {
      nav.innerHTML = groups.map(function (g) {
        return '<a href="#collection-' + escapeHtml(g.collection.id) + '">' +
          escapeHtml(g.collection.title) + " (" + g.entries.length + ")</a>";
      }).join("");
    }

    list.innerHTML = groups.map(function (g) {
      var items = g.entries.map(function (entry) {
        return (
          '<button type="button" class="collection-item" data-id="' + escapeHtml(entry.id) + '" aria-pressed="false">' +
            "<strong>" + escapeHtml(entry.title) + "</strong>" +
            "<span>" + escapeHtml(entry.composer) + "</span>" +
            "<small>" + escapeHtml(entry.year + " · " + entry.city) + "</small>" +
          "</button>"
        );
      }).join("");
      return (
        '<article class="collection-card" id="collection-' + escapeHtml(g.collection.id) + '">' +
          '<div class="collection-card-head">' +
            "<h3>" + escapeHtml(g.collection.title) + ' <span class="collection-count">' + g.entries.length + " 首</span></h3>" +
            "<p>" + escapeHtml(g.collection.description) + "</p>" +
          "</div>" +
          '<div class="collection-items">' + items + "</div>" +
        "</article>"
      );
    }).join("") || '<p class="empty-note">没有匹配的作品，试试放宽筛选条件。</p>';

    Array.prototype.forEach.call(list.querySelectorAll(".collection-item"), function (btn) {
      btn.addEventListener("click", function () {
        selectEntry(btn.getAttribute("data-id"), { focusMap: true, scrollDetail: true });
      });
    });
    highlightSelected();
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
      setText("detail-title", "没有匹配的作品");
      setText("detail-meta", "请调整筛选条件。");
      setText("detail-blurb", "当前筛选没有结果。");
      $("detail-collections").hidden = true;
      $("detail-listening").hidden = true;
      $("detail-map-link").hidden = true;
      $("detail-source").hidden = true;
      return;
    }

    setText("detail-title", entry.title);
    var meta = entry.composer + " · " + entry.work + " · " + entry.year + " · " + entry.city + "，" + entry.country;
    if (entry.mood) { meta += " · " + entry.mood; }
    setText("detail-meta", meta);
    setText("detail-blurb", entry.blurb || "");

    var collContainer = $("detail-collections");
    var collections = getEntryCollections(entry);
    if (collections.length) {
      collContainer.innerHTML = '<span class="detail-collections-label">收录于：</span>' +
        collections.map(function (c) {
          return '<a class="detail-collection-link" href="#collection-' + escapeHtml(c.id) + '">' + escapeHtml(c.title) + "</a>";
        }).join("");
      collContainer.hidden = false;
    } else {
      collContainer.hidden = true;
    }

    var links = buildListeningLinks(entry.listening);
    if (links.length) {
      setText("detail-listening-target", "试听：" + ((entry.listening && entry.listening.target) || entry.title));
      $("detail-listening-links").innerHTML = links.map(function (l) {
        return '<a href="' + l.url + '" target="_blank" rel="noreferrer">' + l.label + "</a>";
      }).join("");
      $("detail-listening").hidden = false;
    } else {
      $("detail-listening").hidden = true;
    }

    var source = $("detail-source");
    if (entry.source && entry.source.url) {
      source.href = entry.source.url;
      source.textContent = "查看参考来源：" + (entry.source.label || "来源");
      source.hidden = false;
    } else {
      source.hidden = true;
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

    if (opts.focusMap) { focusEntryOnMap(entry, false); }
    if (opts.scrollDetail) {
      var detail = $("detail");
      if (detail && detail.scrollIntoView) { detail.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }
  }

  // ---- Sources ------------------------------------------------------------
  function renderSources() {
    var container = $("source-list");
    if (!container) { return; }
    container.innerHTML = ENTRIES.slice().sort(byYearThenCity).map(function (e) {
      if (!e.source) { return ""; }
      return (
        '<article class="source-row">' +
          "<h3>" + escapeHtml(e.title) + ' <span class="source-composer">' + escapeHtml(e.composer) + "</span></h3>" +
          "<p>" + escapeHtml(e.source.summary || "") + "</p>" +
          '<a href="' + escapeHtml(e.source.url) + '" target="_blank" rel="noreferrer">' +
            escapeHtml(e.source.label || e.source.url) + " ↗</a>" +
        "</article>"
      );
    }).join("");
  }

  // ---- Theme toggle -------------------------------------------------------
  function initTheme() {
    var btn = $("theme-toggle");
    if (!btn) { return; }
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      btn.textContent = next === "dark" ? "白天" : "黑夜";
      btn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", next === "dark" ? "切换到白天模式" : "切换到黑夜模式");
      try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch (e) {}
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
    setText("result-count", "共 " + state.filtered.length + " / " + ENTRIES.length + " 首");
    renderMarkers(state.filtered);
    renderCollections(state.filtered);

    var stillVisible = state.filtered.some(function (e) { return e.id === state.selectedId; });
    if (!stillVisible) {
      state.selectedId = null;
      renderDetail(null);
    }
  }

  // ---- Init ---------------------------------------------------------------
  function init() {
    initTheme();
    populateFilters();
    initMap();
    initDetailActions();
    renderSources();
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
