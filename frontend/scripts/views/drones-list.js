import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { ESTADOS_DRON, chipForEstado, matchEstado, formatDate } from "../ui-helpers.js";

const ESTADOS = ESTADOS_DRON;

export const renderDronesList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "04",
    title: "DRONES",
    id: "MOD-04",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/drones/new" style="min-height:36px;padding:0 var(--space-3)">+ ALTA</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/drones/new" title="ALTA DRON" aria-label="Alta de dron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">04</span> FLOTA
        <span class="section-head__id">MOD-04</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR MATRICULA / SERIE..." autocomplete="off" />
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
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center"><span class="spinner"></span><span class="dim">Cargando flota...</span></div></div>
    </section>
  `;

  const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const dronesRaw = await safe(() => api.get("/api/drones"), []);
  const drones = dronesRaw.filter(d => !d.deleted_at);

  const q = main.querySelector("#q");
  const filterChips = [...main.querySelectorAll(".filter-chip")];
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  let activeFilter = "todos";

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = drones.filter(d => {
      if (!matchEstado(d.estado, activeFilter)) return false;
      if (!term) return true;
      return (d.matricula || "").toLowerCase().includes(term)
          || (d.numero_serie || "").toLowerCase().includes(term)
          || (d.nombre_modelo || "").toLowerCase().includes(term);
    });

    countEl.textContent = `${filtered.length}/${drones.length} ACTIVOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((d, idx) => `
      <a class="card card--info" href="#/drones/${d.id_dron}">
        <header class="card__header">
          <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${d.matricula || "—"}</span>
          <span class="card__header-id">SN ${d.numero_serie || "—"}</span>
        </header>
        <div class="card__body">
          <div class="row between mb-2">
            <div>
              <div class="list__primary">${d.nombre_modelo || "—"}</div>
              <div class="list__secondary">${d.fabricante || ""}</div>
            </div>
            ${chipForEstado(d.estado)}
          </div>
          <div class="row between" style="border-top:1px solid var(--outline-variant);padding-top:var(--space-2)">
            <div class="telemetry">
              <span class="telemetry__value">${d.horas_vuelo_acum || 0}<span class="telemetry__unit"> h</span></span>
              <span class="telemetry__label">HORAS ACUM</span>
            </div>
            <div class="telemetry" style="align-items:flex-end">
              <span class="telemetry__value dim">${formatDate(d.fecha_adquisicion)}</span>
              <span class="telemetry__label">ADQUIRIDO</span>
            </div>
          </div>
        </div>
      </a>
    `).join("");
  };

  q.addEventListener("input", apply);
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      filterChips.forEach(c => {
        c.classList.remove("chip--olive");
        c.classList.add("chip--dim");
      });
      chip.classList.remove("chip--dim");
      chip.classList.add("chip--olive");
      apply();
    });
  });

  apply();
};
