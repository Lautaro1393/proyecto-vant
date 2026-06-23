import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { formatDate } from "../ui-helpers.js";

const ESTADOS = [
  { key: "todos",       label: "TODOS" },
  { key: "Planificado", label: "PLANIFICADO" },
  { key: "En Curso",    label: "EN CURSO" },
  { key: "Finalizado",  label: "FINALIZADO" },
  { key: "Pospuesto",   label: "POSPUESTO" },
  { key: "Cancelado",   label: "CANCELADO" },
];

const estadoChip = (e) => {
  const v = (e || "").toLowerCase();
  if (v.includes("curso"))     return "chip--info";
  if (v.includes("finalizado")) return "chip--safe";
  if (v.includes("pospuesto")) return "chip--caution";
  if (v.includes("cancelado")) return "chip--alert";
  return "chip--dim";
};

const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

export const renderPrevistosList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "25",
    title: "PREVISTOS",
    id: "MOD-25",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/previstos/new" style="min-height:36px;padding:0 var(--space-3)">+ PLANIFICAR</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/previstos/new" title="PLANIFICAR MISION" aria-label="Planificar mision">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">25</span> AGENDA
        <span class="section-head__id">MOD-25</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR NOMBRE / SOLICITANTE / DESCRIPCION..." autocomplete="off" />
        <div class="input-wrap__brackets">
          <span class="br-tl"></span><span class="br-tr"></span>
          <span class="br-bl"></span><span class="br-br"></span>
        </div>
      </div>
    </div>

    <div class="filter-chips" id="filter-chips">
      ${ESTADOS.map((e, i) => `
        <button class="chip filter-chip ${i === 0 ? "chip--olive" : "chip--dim"}" data-filter="${e.key}">
          <span class="chip__dot"></span>${e.label}
        </button>
      `).join("")}
    </div>

    <section id="list-slot" class="stack-2">
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center"><span class="spinner"></span><span class="dim">Cargando agenda...</span></div></div>
    </section>
  `;

  const previstos = await safe(() => api.get("/api/previstos"), []);

  const q = main.querySelector("#q");
  const filterChips = [...main.querySelectorAll(".filter-chip")];
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  let activeFilter = "todos";

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = previstos.filter((p) => {
      if (activeFilter !== "todos" && p.previstoscol !== activeFilter) return false;
      if (term) {
        const haystack = `${p.nombre_clave || ""} ${p.solicitante || ""} ${p.descripcion || ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    countEl.textContent = `${filtered.length}/${previstos.length} PLANIFICADOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((p, idx) => `
      <a class="card card--accent" href="#/previstos/${p.id_previstos}">
        <header class="card__header">
          <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${p.nombre_clave || "—"}</span>
          <span class="card__header-id">${formatDate(p.fecha_inicio)} → ${formatDate(p.fecha_fin)}</span>
        </header>
        <div class="card__body">
          <div class="row mb-2" style="gap:var(--space-2);flex-wrap:wrap;align-items:center">
            <span class="dim text-sm">${p.solicitante || "—"}</span>
            <span class="chip ${estadoChip(p.previstoscol)}"><span class="chip__dot"></span>${(p.previstoscol || "—").toUpperCase()}</span>
          </div>
          ${p.descripcion ? `<div class="list__secondary" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.descripcion}</div>` : ""}
        </div>
      </a>
    `).join("");
  };

  q.addEventListener("input", apply);
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      filterChips.forEach((c) => { c.classList.remove("chip--olive"); c.classList.add("chip--dim"); });
      chip.classList.remove("chip--dim");
      chip.classList.add("chip--olive");
      apply();
    });
  });

  apply();
};
