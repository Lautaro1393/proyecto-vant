import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { ROLES, chipForRol, chipForCMA, initials } from "../ui-helpers.js";

export const renderPilotosList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "11",
    title: "PILOTOS",
    id: "MOD-11",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/pilotos/new" style="min-height:36px;padding:0 var(--space-3)">+ ALTA</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/pilotos/new" title="ALTA PILOTO" aria-label="Alta de piloto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">11</span> CREW
        <span class="section-head__id">MOD-11</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR NOMBRE / DNI / EMAIL..." autocomplete="off" />
        <div class="input-wrap__brackets">
          <span class="br-tl"></span><span class="br-tr"></span>
          <span class="br-bl"></span><span class="br-br"></span>
        </div>
      </div>
    </div>

    <div class="filter-chips" id="filter-chips">
      ${ROLES.map((r, i) => `
        <button class="chip filter-chip ${i === 0 ? "chip--olive" : "chip--dim"}" data-filter="${r.key}">
          <span class="chip__dot"></span>${r.label}
        </button>
      `).join("")}
    </div>

    <section id="list-slot" class="stack-2">
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center"><span class="spinner"></span><span class="dim">Cargando crew...</span></div></div>
    </section>
  `;

  const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const pilotosRaw = await safe(() => api.get("/api/pilotos"), []);
  const pilotos = pilotosRaw.filter(p => !p.deleted_at);

  const q = main.querySelector("#q");
  const filterChips = [...main.querySelectorAll(".filter-chip")];
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  let activeFilter = "todos";

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = pilotos.filter(p => {
      if (activeFilter !== "todos" && (p.rol || "").toLowerCase() !== activeFilter) return false;
      if (!term) return true;
      return (p.nombre || "").toLowerCase().includes(term)
          || (p.apellido || "").toLowerCase().includes(term)
          || (p.dni || "").toString().includes(term)
          || (p.email || "").toLowerCase().includes(term);
    });

    countEl.textContent = `${filtered.length}/${pilotos.length} ACTIVOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((p, idx) => {
      const ini = initials(p.nombre, p.apellido);
      const fullName = `${p.nombre || ""} ${p.apellido || ""}`.trim() || p.email || `Piloto #${p.id_pilotos}`;
      return `
        <a class="card card--info" href="#/pilotos/${p.id_pilotos}">
          <header class="card__header">
            <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${fullName}</span>
            <span class="card__header-id">DNI ${p.dni || "—"}</span>
          </header>
          <div class="card__body">
            <div class="row mb-2" style="gap:var(--space-3);align-items:center">
              <div class="avatar avatar--sm">${ini}</div>
              <div style="flex:1;min-width:0">
                <div class="list__primary">${p.email || "—"}</div>
                <div class="list__secondary">${p.contacto || "Sin contacto"}</div>
              </div>
              ${chipForRol(p.rol)}
            </div>
            <div class="row between" style="border-top:1px solid var(--outline-variant);padding-top:var(--space-2)">
              <div class="telemetry">
                <span class="telemetry__value">${p.horas_vuelo_acum || 0}<span class="telemetry__unit"> h</span></span>
                <span class="telemetry__label">HORAS</span>
              </div>
              <div class="telemetry" style="align-items:flex-end">
                ${chipForCMA(p.vencimiento_cma)}
              </div>
            </div>
          </div>
        </a>
      `;
    }).join("");
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
