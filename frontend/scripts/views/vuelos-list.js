import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { parseVueloIds, formatDate } from "../ui-helpers.js";

const climaChip = (clima) => {
  const c = (clima || "").toLowerCase();
  if (c.includes("fuerte") || c.includes("niebla")) return "chip--caution";
  if (c.includes("lluvia") || c.includes("nublado") || c.includes("viento")) return "chip--info";
  return "chip--safe";
};

export const renderVuelosList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "14",
    title: "VUELOS",
    id: "MOD-14",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/vuelos/new" style="min-height:36px;padding:0 var(--space-3)">+ ALTA</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/vuelos/new" title="ALTA VUELO" aria-label="Alta de vuelo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">14</span> OPERACIONES
        <span class="section-head__id">MOD-14</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR PROPOSITO / COORDS / FECHA..." autocomplete="off" />
        <div class="input-wrap__brackets">
          <span class="br-tl"></span><span class="br-tr"></span>
          <span class="br-bl"></span><span class="br-br"></span>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field__label" for="filter-dron">Dron</label>
        <div class="input-wrap">
          <select class="select" id="filter-dron">
            <option value="">TODOS</option>
          </select>
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="filter-piloto">Piloto</label>
        <div class="input-wrap">
          <select class="select" id="filter-piloto">
            <option value="">TODOS</option>
          </select>
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field__label" for="filter-desde">Desde</label>
        <div class="input-wrap">
          <input class="input" id="filter-desde" type="date" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="filter-hasta">Hasta</label>
        <div class="input-wrap">
          <input class="input" id="filter-hasta" type="date" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>
    </div>

    <section id="list-slot" class="stack-2">
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center"><span class="spinner"></span><span class="dim">Cargando operaciones...</span></div></div>
    </section>
  `;

  const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const [vuelos, drones, pilotos] = await Promise.all([
    safe(() => api.get("/api/vuelos"), []),
    safe(() => api.get("/api/drones"), []),
    safe(() => api.get("/api/pilotos"), []),
  ]);

  const dronById = new Map(drones.map(d => [Number(d.id_dron), d]));
  const pilotoById = new Map(pilotos.map(p => [Number(p.id_pilotos), p]));

  const selDron = main.querySelector("#filter-dron");
  const selPiloto = main.querySelector("#filter-piloto");
  drones.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id_dron;
    opt.textContent = `${d.matricula || "—"} · ${d.nombre_modelo || ""}`.trim();
    selDron.appendChild(opt);
  });
  pilotos.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id_pilotos;
    const full = `${p.nombre || ""} ${p.apellido || ""}`.trim() || p.email || `Piloto #${p.id_pilotos}`;
    opt.textContent = full;
    selPiloto.appendChild(opt);
  });

  const q = main.querySelector("#q");
  const inDesde = main.querySelector("#filter-desde");
  const inHasta = main.querySelector("#filter-hasta");
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const dronId = selDron.value ? Number(selDron.value) : null;
    const pilotoId = selPiloto.value ? Number(selPiloto.value) : null;
    const desde = inDesde.value || null;
    const hasta = inHasta.value || null;

    const filtered = vuelos.filter(v => {
      const dronesIds = parseVueloIds(v.drones_ids);
      const pilotosIds = parseVueloIds(v.pilotos_ids);

      if (dronId && !dronesIds.includes(dronId)) return false;
      if (pilotoId && !pilotosIds.includes(pilotoId)) return false;

      const fechaStr = (v.fecha || "").slice(0, 10);
      if (desde && fechaStr < desde) return false;
      if (hasta && fechaStr > hasta) return false;

      if (term) {
        const dronLabels = dronesIds.map(id => dronById.get(id)?.matricula || "").join(" ");
        const pilotoLabels = pilotosIds.map(id => {
          const p = pilotoById.get(id);
          return p ? `${p.nombre || ""} ${p.apellido || ""}` : "";
        }).join(" ");
        const haystack = [
          v.proposito || "",
          v.coordenadas || "",
          fechaStr,
          formatDate(v.fecha),
          v.clima || "",
          dronLabels,
          pilotoLabels,
        ].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    countEl.textContent = `${filtered.length}/${vuelos.length} REGISTRADOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((v, idx) => {
      const dronesIds = parseVueloIds(v.drones_ids);
      const bateriasIds = parseVueloIds(v.baterias_ids);
      const pilotosIds = parseVueloIds(v.pilotos_ids);

      const dronLabels = dronesIds.map(id => dronById.get(id)?.matricula || `#${id}`).filter(Boolean);
      const pilotoLabels = pilotosIds.map(id => {
        const p = pilotoById.get(id);
        if (!p) return `#${id}`;
        return `${p.nombre || ""} ${p.apellido || ""}`.trim() || p.email || `#${id}`;
      });

      const dronChips = dronLabels.slice(0, 2).map(m => `<span class="chip chip--dim"><span class="chip__dot"></span>${m}</span>`).join(" ");
      const dronExtra = dronLabels.length > 2 ? ` <span class="chip chip--dim">+${dronLabels.length - 2}</span>` : "";
      const pilotoChips = pilotoLabels.slice(0, 2).map(p => `<span class="chip chip--info"><span class="chip__dot"></span>${p}</span>`).join(" ");
      const pilotoExtra = pilotoLabels.length > 2 ? ` <span class="chip chip--dim">+${pilotoLabels.length - 2}</span>` : "";

      const estadoLabel = (v.estado || "Realizado").toUpperCase();
      const estadoCls = estadoLabel === "REALIZADO" ? "chip--safe" : (estadoLabel === "CANCELADO" ? "chip--alert" : "chip--caution");

      return `
        <a class="card card--info" href="#/vuelos/${v.id_vuelo}">
          <header class="card__header">
            <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${v.proposito || "Vuelo"}</span>
            <span class="card__header-id">${formatDate(v.fecha)}</span>
          </header>
          <div class="card__body">
            <div class="row mb-2" style="gap:var(--space-2);flex-wrap:wrap;align-items:center">
              <span class="telemetry__value" style="font-size:18px">${v.tiempo_de_vuelo || "—"}</span>
              <span class="dim">·</span>
              <span class="dim text-sm">${v.coordenadas || "—"}</span>
            </div>
            <div class="row" style="gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-2)">
              <span class="chip ${estadoCls}"><span class="chip__dot"></span>${estadoLabel}</span>
              <span class="chip ${climaChip(v.clima)}"><span class="chip__dot"></span>${(v.clima || "—").toUpperCase()}</span>
              <span class="chip chip--dim"><span class="chip__dot"></span>DRONES ${dronesIds.length}</span>
              <span class="chip chip--dim"><span class="chip__dot"></span>BAT ${bateriasIds.length}</span>
              <span class="chip chip--dim"><span class="chip__dot"></span>PILOTOS ${pilotosIds.length}</span>
            </div>
            ${dronLabels.length || pilotoLabels.length ? `
              <div class="row" style="gap:var(--space-1);flex-wrap:wrap;margin-top:var(--space-2);padding-top:var(--space-2);border-top:1px solid var(--outline-variant)">
                ${dronChips}${dronExtra}
                ${pilotoChips}${pilotoExtra}
              </div>
            ` : ""}
          </div>
        </a>
      `;
    }).join("");
  };

  q.addEventListener("input", apply);
  selDron.addEventListener("change", apply);
  selPiloto.addEventListener("change", apply);
  inDesde.addEventListener("change", apply);
  inHasta.addEventListener("change", apply);

  apply();
};
