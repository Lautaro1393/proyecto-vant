// Busqueda global: shortcut Cmd+K (o '/') abre un modal con resultados
// agrupados por tipo. Busca contra 5 endpoints en paralelo, filtra
// client-side por el termino, y navega al detail con Enter o click.

import { api } from "./api.js";

const PER_GROUP = 5;

const SEARCH_GROUPS = [
  { key: "drones",        label: "DRONES",     icon: "drone",   fetch: () => api.get("/api/drones"),
    getId: d => d.id_dron,   getHash: d => `/drones/${d.id_dron}`,
    matches: (d, q) => (d.matricula || "").toLowerCase().includes(q) || (d.numero_de_serie || "").toString().includes(q) || (d.nombre_modelo || "").toLowerCase().includes(q),
    render: (d) => ({ primary: d.matricula || "—", secondary: `${d.nombre_modelo || "—"} · ${d.horas_vuelo_acum || 0} min` }) },
  { key: "pilotos",       label: "PILOTOS",    icon: "user",    fetch: () => api.get("/api/pilotos"),
    getId: p => p.id_pilotos, getHash: p => `/pilotos/${p.id_pilotos}`,
    matches: (p, q) => (p.nombre || "").toLowerCase().includes(q) || (p.apellido || "").toLowerCase().includes(q) || (p.dni || "").toString().includes(q) || (p.email || "").toLowerCase().includes(q),
    render: (p) => ({ primary: `${p.nombre || ""} ${p.apellido || ""}`.trim() || p.email || "—", secondary: `DNI ${p.dni || "—"} · ${p.email || ""}` }) },
  { key: "baterias",      label: "BATERIAS",   icon: "tag",     fetch: () => api.get("/api/baterias"),
    getId: b => b.id_bateria, getHash: b => null,
    matches: (b, q) => (b.numero_de_serie || "").toLowerCase().includes(q) || (b.estado || "").toLowerCase().includes(q),
    render: (b) => ({ primary: b.numero_de_serie || `Bat #${b.id_bateria}`, secondary: `${b.capacidad || "?"} mAh · ${b.voltage || "?"}V · ${b.ciclos_de_carga || 0} ciclos` }) },
  { key: "vuelos",        label: "VUELOS",     icon: "arrow",   fetch: () => api.get("/api/vuelos"),
    getId: v => v.id_vuelo,   getHash: v => `/vuelos/${v.id_vuelo}`,
    matches: (v, q) => (v.proposito || "").toLowerCase().includes(q) || (v.coordenadas || "").includes(q),
    render: (v) => ({ primary: v.proposito || `Vuelo #${v.id_vuelo}`, secondary: `${(v.fecha || "").slice(0, 10)} · ${v.tiempo_de_vuelo || "—"}` }) },
  { key: "mantenimientos",label: "MANTENIMIENTOS", icon: "wrench", fetch: () => api.get("/api/mantenimientos"),
    getId: m => m.id_mantenimiento, getHash: m => `/mantenimientos/${m.id_mantenimiento}`,
    matches: (m, q) => (m.tipo || "").toLowerCase().includes(q) || (m.descripcion || "").toLowerCase().includes(q) || (m.dron_matricula || "").toLowerCase().includes(q),
    render: (m) => ({ primary: m.tipo || `Mant #${m.id_mantenimiento}`, secondary: `${m.dron_matricula || "—"} · ${(m.fecha || "").slice(0, 10)}` }) },
  { key: "previstos",     label: "MISIONES",   icon: "calendar",fetch: () => api.get("/api/previstos"),
    getId: p => p.id_previstos, getHash: p => `/previstos/${p.id_previstos}`,
    matches: (p, q) => (p.nombre_clave || "").toLowerCase().includes(q) || (p.solicitante || "").toLowerCase().includes(q) || (p.descripcion || "").toLowerCase().includes(q),
    render: (p) => ({ primary: p.nombre_clave || `Mision #${p.id_previstos}`, secondary: `${p.solicitante || "—"} · ${(p.fecha_inicio || "").slice(0, 10)}` }) },
  { key: "modelos",       label: "MODELOS",    icon: "tag",     fetch: () => api.get("/api/modelos"),
    getId: m => m.id_modelo_dron, getHash: m => `/modelos`,
    matches: (m, q) => (m.modelo || "").toLowerCase().includes(q) || (m.fabricante || "").toLowerCase().includes(q),
    render: (m) => ({ primary: m.modelo || "—", secondary: m.fabricante || "—" }) },
];

let cache = null;
let cacheAt = 0;
const CACHE_TTL_MS = 30_000;

const ensureCache = async () => {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  const results = await Promise.allSettled(SEARCH_GROUPS.map(async g => {
    const rows = await g.fetch();
    return { key: g.key, rows: Array.isArray(rows) ? rows : [] };
  }));
  cache = {};
  results.forEach((r, i) => {
    const g = SEARCH_GROUPS[i];
    if (r.status === "fulfilled") cache[g.key] = r.value.rows;
    else cache[g.key] = [];
  });
  cacheAt = Date.now();
  return cache;
};

const buildResults = (cache, term) => {
  const q = (term || "").toLowerCase().trim();
  if (!q) return [];
  return SEARCH_GROUPS.map(g => {
    const rows = cache[g.key] || [];
    const matches = rows.filter(r => g.matches(r, q)).slice(0, PER_GROUP);
    return { group: g, matches };
  }).filter(s => s.matches.length > 0);
};

const flatten = (grouped) => {
  const out = [];
  grouped.forEach(s => s.matches.forEach(m => out.push({ group: s.group, row: m })));
  return out;
};

let modal = null;
let inputEl = null;
let resultsEl = null;
let currentGrouped = [];
let currentFlat = [];
let currentIndex = 0;

const open = async () => {
  if (modal) return;
  modal = document.createElement("div");
  modal.className = "search-modal";
  modal.innerHTML = `
    <div class="search-modal__backdrop" data-close></div>
    <div class="search-modal__panel">
      <div class="search-modal__input-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-modal__input" type="search" placeholder="Buscar drones, pilotos, vuelos, etc..." autocomplete="off" />
        <kbd class="search-modal__kbd">ESC</kbd>
      </div>
      <div class="search-modal__results"></div>
      <div class="search-modal__footer">
        <span><kbd>↑↓</kbd> navegar</span>
        <span><kbd>↵</kbd> seleccionar</span>
        <span><kbd>ESC</kbd> cerrar</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  inputEl = modal.querySelector(".search-modal__input");
  resultsEl = modal.querySelector(".search-modal__results");
  modal.querySelector("[data-close]").addEventListener("click", close);
  inputEl.addEventListener("input", () => render(inputEl.value));
  inputEl.addEventListener("keydown", onKey);
  modal.addEventListener("keydown", onKey);
  // Mostrar skeleton mientras carga
  resultsEl.innerHTML = `<div class="search-modal__hint dim">Cargando indices...</div>`;
  try {
    await ensureCache();
  } catch (e) {
    console.error("[search] cache load failed:", e);
  }
  inputEl.focus();
  render("");
};

const close = () => {
  if (!modal) return;
  modal.remove();
  modal = inputEl = resultsEl = null;
  currentGrouped = currentFlat = [];
  currentIndex = 0;
};

const render = (term) => {
  if (!modal) return;
  if (!cache) {
    resultsEl.innerHTML = `<div class="search-modal__hint dim">Inicializando...</div>`;
    return;
  }
  currentGrouped = buildResults(cache, term);
  currentFlat = flatten(currentGrouped);
  if (currentIndex >= currentFlat.length) currentIndex = 0;
  if (!term) {
    resultsEl.innerHTML = `
      <div class="search-modal__hint dim">
        <p>Empieza a escribir para buscar</p>
        <p class="text-sm" style="margin-top:var(--space-2)">Drones · Pilotos · Baterias · Vuelos · Mantenimientos · Misiones · Modelos</p>
      </div>
    `;
    return;
  }
  if (currentFlat.length === 0) {
    resultsEl.innerHTML = `<div class="search-modal__hint dim">Sin resultados para "<strong>${escapeHtml(term)}</strong>"</div>`;
    return;
  }
  let flatIdx = 0;
  resultsEl.innerHTML = currentGrouped.map(s => `
    <div class="search-group">
      <div class="search-group__head"><span class="label-caps">${s.group.label}</span> <span class="dim text-sm">${s.matches.length}${s.matches.length === PER_GROUP ? "+" : ""}</span></div>
      ${s.matches.map(m => {
        const idx = flatIdx++;
        const r = s.group.render(m);
        const selected = idx === currentIndex ? "search-item--active" : "";
        return `<a class="search-item ${selected}" href="${s.group.getHash(m) || "#"}" data-hash="${s.group.getHash(m) || ""}" data-idx="${idx}">
          <span class="search-item__primary">${escapeHtml(r.primary)}</span>
          <span class="search-item__secondary dim text-sm">${escapeHtml(r.secondary)}</span>
        </a>`;
      }).join("")}
    </div>
  `).join("");
  // Hookear clicks
  resultsEl.querySelectorAll("[data-hash]").forEach(a => {
    a.addEventListener("click", (e) => {
      const hash = a.dataset.hash;
      if (!hash) { e.preventDefault(); return; }
      e.preventDefault();
      close();
      window.location.hash = `#${hash.startsWith("/") ? hash : "/" + hash}`;
    });
  });
};

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

const onKey = (e) => {
  if (!modal) return;
  if (e.key === "Escape") { e.preventDefault(); close(); return; }
  if (e.key === "ArrowDown") { e.preventDefault(); currentIndex = Math.min(currentIndex + 1, currentFlat.length - 1); render(inputEl.value); scrollToActive(); return; }
  if (e.key === "ArrowUp")   { e.preventDefault(); currentIndex = Math.max(currentIndex - 1, 0); render(inputEl.value); scrollToActive(); return; }
  if (e.key === "Enter") {
    e.preventDefault();
    const item = currentFlat[currentIndex];
    if (item) {
      const hash = item.group.getHash(item.row);
      if (hash) { close(); window.location.hash = `#${hash}`; }
    }
  }
};

const scrollToActive = () => {
  if (!resultsEl) return;
  const active = resultsEl.querySelector(".search-item--active");
  if (active) active.scrollIntoView({ block: "nearest" });
};

export const bindGlobalSearch = () => {
  document.addEventListener("keydown", (e) => {
    const inField = e.target.matches && e.target.matches('input, textarea, select, [contenteditable="true"]');
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); return; }
    if (e.key === "/" && !inField) { e.preventDefault(); open(); return; }
  });
  // Boton de busqueda en el header (inyectado via shell de cada vista
  // buscando data-search-trigger) o cualquier boton con id btn-search
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btn-search")) { e.preventDefault(); open(); }
  });
};
