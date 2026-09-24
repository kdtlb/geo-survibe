/* ============================================================
   SURVIBE · Geoportal Turístico de Bolivia — App
   ============================================================ */
(function () {
  'use strict';

  const DATA = window.SURVIBE_DATA || {};

  /* ---------- Iconos SVG ---------- */
  const I = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>',
    target: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-linecap="round"/></svg>',
    hike: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.6"/><path d="M9 20l2-6-2.5-2L7 8l3-1 3 3 3 1M11 14l1.5 6M14.5 11l1 3"/></svg>',
    leaf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 15-9 0 11-4 15-8 16Z"/><path d="M4 20c4-6 8-8 12-9"/></svg>',
    map: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/></svg>',
    water: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    layers: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>'
  };

  /* ---------- Mapa ---------- */
  const map = L.map('map', {
    center: GEO.center, zoom: GEO.zoom, zoomControl: false,
    minZoom: 3, maxZoom: 19, attributionControl: true, worldCopyJump: true
  });
  L.control.zoom({ position: 'topleft' }).addTo(map);
  L.control.scale({ position: 'bottomright', imperial: false, maxWidth: 160 }).addTo(map);

  // Basemap
  let currentBase = [];
  function setBasemap(key) {
    currentBase.forEach(l => map.removeLayer(l));
    currentBase = [];
    const b = BASEMAPS[key];
    const base = L.tileLayer(b.url, b.options).addTo(map);
    base.bringToBack();
    currentBase.push(base);
    if (b.labels) { // capa de etiquetas opcional (Esri gray canvas)
      currentBase.push(L.tileLayer(b.labels, b.options).addTo(map));
    }
    document.querySelectorAll('.basemap-btn').forEach(el =>
      el.classList.toggle('active', el.dataset.key === key));
    const cur = document.getElementById('basemap-current');
    if (cur) cur.textContent = b.label;
  }

  /* ---------- Estado ---------- */
  const overlays = {};                 // id -> L.Layer (polígonos)
  let caminataGroup = null;            // L.LayerGroup de caminatas
  let caminataFeatures = [];           // features caminatas

  /* ---------- Construcción de capas de polígonos ---------- */
  function buildPolygon(cfg) {
    const gj = DATA[cfg.data];
    if (!gj) return null;
    let idx = 0;

    // Capas de solo borde (departamentos, municipios): no clickeables ni con hover
    if (cfg.interactive === false) {
      return L.geoJSON(gj, { interactive: false, style: (f) => cfg.style(f, idx++) });
    }

    const layer = L.geoJSON(gj, {
      style: (f) => cfg.style(f, idx++),
      onEachFeature: (feature, lyr) => {
        const base = lyr.options;
        lyr.on('mouseover', () => {
          if (cfg.hoverFill != null) lyr.setStyle({ fillOpacity: cfg.hoverFill });
          lyr.setStyle({ weight: (base.weight || 1) + 1.2 });
          if (lyr.bringToFront) lyr.bringToFront();
        });
        lyr.on('mouseout', () => layer.resetStyle(lyr));
        lyr.bindPopup(popupHTML(cfg, feature.properties), { closeButton: true, maxWidth: 280 });
      }
    });
    return layer;
  }

  function popupHTML(cfg, props) {
    const title = props[cfg.titleField] || '—';
    let rows = '';
    cfg.fields.forEach(([key, label]) => {
      if (key === cfg.titleField) return;
      let v = props[key];
      if (v === null || v === undefined || v === '') v = '—';
      rows += `<div class="pop-row"><b>${label}:</b> ${v}</div>`;
    });
    return `<div class="pop-kicker">${cfg.kicker}</div>
            <h3 class="pop-title">${title}</h3>${rows}`;
  }

  /* ---------- Caminatas ---------- */
  function caminataIcon() {
    return L.divIcon({
      className: '',
      html: '<span class="cm-dot"></span>',
      iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -8]
    });
  }

  function buildCaminatas() {
    const gj = DATA.caminatas;
    caminataFeatures = (gj && gj.features) || [];
    renderCaminatas();
  }

  function renderCaminatas() {
    if (caminataGroup) map.removeLayer(caminataGroup);
    caminataGroup = L.layerGroup();
    caminataFeatures.forEach((f, i) => {
      const c = f.geometry.coordinates;
      const m = L.marker([c[1], c[0]], { icon: caminataIcon() });
      m.bindTooltip(f.properties.Caminata || 'Caminata',
        { direction: 'top', offset: [0, -12], className: 'cm-tip' });
      m.on('click', () => openDetails(f));
      m._survibeIndex = i;
      caminataGroup.addLayer(m);
    });
    if (isOn('caminatas')) caminataGroup.addTo(map);
  }

  function isOn(id) {
    const el = document.querySelector(`.layer[data-id="${id}"]`);
    return el && el.classList.contains('active');
  }

  /* ---------- Panel de detalles (caminatas) ---------- */
  const NOTES = {
    1: 'Sendero accesible, de baja exigencia física. Ideal para familias y una primera experiencia de senderismo en la región.',
    2: 'Recorrido de exigencia media, con tramos de pendiente. Se recomienda calzado adecuado y buena hidratación.',
    3: 'Travesía de alta exigencia. Requiere experiencia, buena condición física y preferentemente guía local.',
    0: 'Ruta escénica de la red Survibe. Consulta con un guía local sobre distancia, duración y punto de partida.'
  };

  function openDetails(feature) {
    const p = feature.properties;
    const diff = p.Dificultad || 0;
    const d = diffOf(diff);
    const c = feature.geometry.coordinates;
    const stars = '★★★'.slice(0, d.stars) + '☆☆☆'.slice(0, 3 - d.stars);
    const panel = document.getElementById('details');
    panel.querySelector('.details__title').textContent = p.Caminata || 'Caminata';
    panel.querySelector('.details__banner').style.borderLeftColor = d.color;
    panel.querySelector('.details__body').innerHTML = `
      <div class="detail-badge" style="background:${hexA(d.color, 0.12)};color:${d.color};border:1px solid ${hexA(d.color, 0.35)}">
        <span class="pin" style="background:${d.color}"></span> Dificultad: ${d.label}
      </div>
      <div class="kv"><span class="k">Nivel de dificultad</span><span class="v detail-stars">${d.stars ? stars : '—'}</span></div>
      <div class="kv"><span class="k">Coordenadas</span><span class="v">${c[1].toFixed(5)}, ${c[0].toFixed(5)}</span></div>
      <div class="kv"><span class="k">Región</span><span class="v">Departamento de Tarija · Bolivia</span></div>
      <div class="detail-note">${NOTES[diff] || NOTES[0]}</div>
    `;
    panel.classList.add('open');
    map.setView([c[1], c[0]], Math.max(map.getZoom(), 12), { animate: true });
  }
  function closeDetails() { document.getElementById('details').classList.remove('open'); }

  /* ---------- Utilidades color ---------- */
  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ---------- Toggle de capa ---------- */
  function toggleLayer(id, force) {
    const el = document.querySelector(`.layer[data-id="${id}"]`);
    const willOn = force != null ? force : !el.classList.contains('active');
    el.classList.toggle('active', willOn);
    if (id === 'caminatas') {
      if (willOn) { if (caminataGroup) caminataGroup.addTo(map); }
      else if (caminataGroup) map.removeLayer(caminataGroup);
      return;
    }
    const lyr = overlays[id];
    if (!lyr) return;
    if (willOn) { lyr.addTo(map); keepOrder(); }
    else map.removeLayer(lyr);
  }

  // Mantiene el orden de dibujado definido en LAYERS
  function keepOrder() {
    LAYERS.forEach(cfg => {
      if (cfg.id === 'caminatas') return;
      const lyr = overlays[cfg.id];
      if (lyr && map.hasLayer(lyr) && lyr.bringToFront) lyr.bringToFront();
    });
    if (caminataGroup && map.hasLayer(caminataGroup)) {
      caminataGroup.eachLayer(m => m.setZIndexOffset && m.setZIndexOffset(1000));
    }
  }

  /* ============================================================
     UI: construcción del DOM
     ============================================================ */
  function buildSidebar() {
    // Grupos de capas
    const host = document.getElementById('layer-groups');
    GROUPS.forEach(g => {
      const items = LAYERS.filter(l => l.group === g.id);
      if (!items.length) return;
      const box = document.createElement('div');
      box.className = 'lgroup';
      box.innerHTML = `<div class="lgroup__head"><span class="gi">${I[g.icon] || ''}</span>${g.name}</div>`;
      items.forEach(cfg => box.appendChild(layerRow(cfg)));
      host.appendChild(box);
    });
  }

  function layerRow(cfg) {
    const row = document.createElement('div');
    row.className = 'layer' + (cfg.on ? ' active' : '');
    row.dataset.id = cfg.id;
    const sk = cfg.swatchKind || 'poly';
    row.innerHTML = `
      <span class="layer__swatch ${sk}" style="background:${cfg.swatch}"></span>
      <span class="layer__info">
        <span class="layer__name">${cfg.name}</span>
      </span>
      <span class="switch"></span>`;
    row.addEventListener('click', () => toggleLayer(cfg.id));
    return row;
  }

  function buildBasemaps() {
    const host = document.getElementById('basemaps');
    host.innerHTML = '';
    const thumb = { // tile representativa de Bolivia (z5), sin API key
      oscuro: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/5/17/10',
      satelite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/17/10',
      terreno: 'https://a.tile.opentopomap.org/5/10/17.png',
      claro: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/5/17/10'
    };

    const toggle = document.createElement('button');
    toggle.className = 'basemap-toggle';
    toggle.innerHTML = `${I.layers}<span id="basemap-current">Mapa base</span>`;

    const list = document.createElement('div');
    list.className = 'basemap-list';
    BASEMAP_ORDER.forEach(key => {
      const b = BASEMAPS[key];
      const btn = document.createElement('button');
      btn.className = 'basemap-btn';
      btn.dataset.key = key;
      btn.style.backgroundImage = `url(${thumb[key]})`;
      btn.innerHTML = `<span>${b.label}</span>`;
      btn.addEventListener('click', () => { setBasemap(key); list.classList.remove('open'); });
      list.appendChild(btn);
    });

    toggle.addEventListener('click', (e) => { e.stopPropagation(); list.classList.toggle('open'); });
    document.addEventListener('click', (e) => { if (!e.target.closest('#basemaps')) list.classList.remove('open'); });

    host.appendChild(toggle);
    host.appendChild(list);
  }

  /* ---------- Buscador de caminatas ---------- */
  function setupSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    function render(q) {
      const term = q.trim().toLowerCase();
      results.innerHTML = '';
      if (!term) { results.classList.remove('open'); return; }
      const matches = caminataFeatures
        .filter(f => (f.properties.Caminata || '').toLowerCase().includes(term))
        .slice(0, 8);
      if (!matches.length) {
        results.innerHTML = `<div class="search__item" style="color:var(--text-faint)">Sin resultados</div>`;
        results.classList.add('open'); return;
      }
      matches.forEach(f => {
        const it = document.createElement('div');
        it.className = 'search__item';
        it.innerHTML = `<span class="dot" style="background:${CAMINATA_COLOR}"></span>${f.properties.Caminata}`;
        it.addEventListener('click', () => {
          results.classList.remove('open');
          input.value = f.properties.Caminata;
          toggleLayer('caminatas', true);
          openDetails(f);
        });
        results.appendChild(it);
      });
      results.classList.add('open');
    }
    input.addEventListener('input', e => render(e.target.value));
    input.addEventListener('focus', e => { if (e.target.value) render(e.target.value); });
    document.addEventListener('click', e => {
      if (!e.target.closest('.search')) results.classList.remove('open');
    });
  }

  /* ---------- Coordenadas ---------- */
  function setupCoords() {
    const el = document.getElementById('coords-val');
    map.on('mousemove', e => {
      el.innerHTML = `<b>Lat</b> ${e.latlng.lat.toFixed(4)} &nbsp; <b>Lon</b> ${e.latlng.lng.toFixed(4)}`;
    });
  }

  /* ---------- Acciones de mapa ---------- */
  function setupActions() {
    document.getElementById('act-bolivia').addEventListener('click', () => {
      map.flyToBounds(GEO.bounds, { padding: [30, 30], duration: 0.8 });
    });
    document.getElementById('act-caminatas').addEventListener('click', () => {
      toggleLayer('caminatas', true);
      map.flyTo(GEO.caminatasView.center, GEO.caminatasView.zoom, { duration: 0.9 });
    });
    // Sidebar móvil (abrir / cerrar con backdrop y botón de cierre)
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const openSidebar = () => { sidebar.classList.add('open'); backdrop.classList.add('show'); };
    const closeSidebar = () => { sidebar.classList.remove('open'); backdrop.classList.remove('show'); };
    document.getElementById('sidebar-toggle').addEventListener('click', openSidebar);
    document.getElementById('side-close').addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);
    document.querySelector('.details__close').addEventListener('click', closeDetails);
    document.getElementById('brand').addEventListener('click', () => {
      map.flyToBounds(GEO.bounds, { padding: [30, 30], duration: 0.8 });
    });
  }

  /* ============================================================
     Init
     ============================================================ */
  function init() {
    injectIcons();

    // La barra lateral debe existir antes de crear las capas:
    // el estado on/off de las caminatas se lee de las filas de capa.
    buildSidebar();
    buildBasemaps();
    setBasemap('claro'); // tras crear los botones, para resaltar el activo

    // Construir overlays de polígonos
    LAYERS.forEach(cfg => {
      if (cfg.kind === 'polygon') {
        const lyr = buildPolygon(cfg);
        if (lyr) { overlays[cfg.id] = lyr; if (cfg.on) lyr.addTo(map); }
      }
    });
    buildCaminatas();
    keepOrder();

    setupSearch();
    setupCoords();
    setupActions();

    map.on('overlayadd overlayremove zoomend', keepOrder);

    // Ocultar loader
    setTimeout(() => document.getElementById('loader').classList.add('hide'), 500);
  }

  function injectIcons() {
    document.getElementById('ico-search').innerHTML = I.search;
    document.getElementById('ico-menu').innerHTML = I.menu;
    document.getElementById('ico-bolivia').innerHTML = I.globe;
    document.getElementById('ico-caminatas').innerHTML = I.target;
    document.querySelector('.details__close').innerHTML = I.close;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
