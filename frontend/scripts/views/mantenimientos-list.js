import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { formatDate } from "../ui-helpers.js";

const TIPOS = [
  { key: "todos",       label: "TODOS" },
  { key: "Preventivo",  label: "PREVENTIVO" },
  { key: "Correctivo",  label: "CORRECTIVO" },
  { key: "Actualizacion de Firmware", label: "FIRMWARE" },
  { key: "Calibracion", label: "CALIBRACION" },
];

const tipoChip = (tipo) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("correctivo")) return "chip--alert";
  if (t.includes("firmware") || t.includes("calibracion")) return "chip--info";
  if (t.includes("preventivo")) return "chip--safe";
  return "chip--dim";
};

const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

export const renderMantenimientosList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "22",
    title: "MANTENIMIENTOS",
    id: "MOD-22",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/mantenimientos/new" style="min-height:36px;padding:0 var(--space-3)">+ REGISTRAR</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/mantenimientos/new" title="REGISTRAR MANTENIMIENTO" aria-label="Registrar mantenimiento">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">22</span> TALLER
        <span class="section-head__id">MOD-22</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR DESCRIPCION / DRON / FECHA..." autocomplete="off" />
        <div class="input-wrap__brackets">
          <span class="br-tl"></span><span class="br-tr"></span>
          <span class="br-bl"></span><span class="br-br"></span>
        </div>
      </div>
    </div>

    <div class="filter-chips" id="filter-chips">
      ${TIPOS.map((t, i) => `
        <button class="chip filter-chip ${i === 0 ? "chip--olive" : "chip--dim"}" data-filter="${t.key}">
          <span class="chip__dot"></span>${t.label}
        </button>
      `).join("")}
    </div>

    <section id="list-slot" class="stack-2">
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center"><span class="spinner"></span><span class="dim">Cargando taller...</span></div></div>
    </section>
  `;

  const [mantenimientos, drones] = await Promise.all([
    safe(() => api.get("/api/mantenimientos"), []),
    safe(() => api.get("/api/drones"), []),
  ]);

  const dronById = new Map(drones.map((d) => [Number(d.id_dron), d]));

  const q = main.querySelector("#q");
  const filterChips = [...main.querySelectorAll(".filter-chip")];
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  let activeFilter = "todos";

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = mantenimientos.filter((m) => {
      if (activeFilter !== "todos" && m.tipo !== activeFilter) return false;
      if (term) {
        const dron = dronById.get(Number(m.dron_id));
        const haystack = [
          m.descripcion || "",
          m.tipo || "",
          formatDate(m.fecha),
          dron?.matricula || "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    countEl.textContent = `${filtered.length}/${mantenimientos.length} REGISTRADOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((m, idx) => {
      const dron = dronById.get(Number(m.dron_id));
      return `
        <a class="card card--info" href="#/mantenimientos/${m.id_mantenimiento}">
          <header class="card__header">
            <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${m.tipo || "Mantenimiento"}</span>
            <span class="card__header-id">${formatDate(m.fecha)}</span>
          </header>
          <div class="card__body">
            <div class="list__primary" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.descripcion || "—"}</div>
            <div class="row between mt-2" style="gap:var(--space-2);flex-wrap:wrap;align-items:center">
              <span class="dim text-sm">${dron ? dron.matricula : "Dron #" + m.dron_id}</span>
              <span class="chip ${tipoChip(m.tipo)}"><span class="chip__dot"></span>${(m.tipo || "—").toUpperCase()}</span>
            </div>
            <div class="row between mt-2" style="gap:var(--space-2);border-top:1px solid var(--outline-variant);padding-top:var(--space-2)">
              <div class="telemetry">
                <span class="telemetry__value">$${Number(m.costo || 0).toLocaleString("es-AR")}</span>
                <span class="telemetry__label">COSTO</span>
              </div>
              <div class="telemetry" style="align-items:flex-end">
                <span class="telemetry__value">${m.horas_de_vuelo || 0}<span class="telemetry__unit">h</span></span>
                <span class="telemetry__label">DRON</span>
              </div>
            </div>
          </div>
        </a>
      `;
    }).join("");
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
