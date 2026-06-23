import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { chipForEstado, segBar, formatDate } from "../ui-helpers.js";

export const renderDashboard = async (root) => {
  const user = getUser();
  root.innerHTML = renderShell({
    titlePrefix: "01",
    title: "OPS OVERVIEW",
    id: "MOD-00",
    user,
  });
  const main = bindShell(root, user);
  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">01</span> OVERVIEW
        <span class="section-head__id">MOD-00</span>
      </div>
      <span class="dim" id="updated-at"></span>
    </header>

    <section id="stats-slot" class="stats">
      ${Array.from({ length: 4 }, () => `<div class="stats__cell"><span class="spinner"></span></div>`).join("")}
    </section>

    <div class="grid-2 mt-3">
      <article class="card card--info">
        <header class="card__header">
          <span><span class="card__header-prefix">02</span> FLOTA ACTIVA</span>
          <span class="card__header-id">MOD-01</span>
        </header>
        <div class="card__body" id="fleet-slot">
          <span class="spinner"></span>
        </div>
      </article>

      <article class="card card--accent">
        <header class="card__header">
          <span><span class="card__header-prefix">03</span> VUELOS RECIENTES</span>
          <span class="card__header-id">MOD-02</span>
        </header>
        <div class="card__body" id="recent-flights-slot">
          <span class="spinner"></span>
        </div>
      </article>
    </div>

    <div class="grid-2 mt-3">
      <article class="card card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">04</span> MANTENIMIENTOS</span>
          <span class="card__header-id">MOD-03</span>
        </header>
        <div class="card__body" id="mant-slot">
          <span class="spinner"></span>
        </div>
      </article>

      <article class="card card--info">
        <header class="card__header">
          <span><span class="card__header-prefix">05</span> PROXIMAS MISIONES</span>
          <span class="card__header-id">MOD-04</span>
        </header>
        <div class="card__body" id="prev-slot">
          <span class="spinner"></span>
        </div>
      </article>
    </div>

    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">06</span> ESTADO DE BATERIAS</span>
        <span class="card__header-id">MOD-05</span>
      </header>
      <div class="card__body card__body--flush" id="battery-slot">
        <span class="spinner" style="margin:var(--space-3)"></span>
      </div>
    </article>
  `;

  document.getElementById("updated-at").textContent = new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";

  const safe = async (fn, fallback = []) => { try { return await fn(); } catch (e) { console.error(e); return fallback; } };

  const [drones, baterias, mantenimientos, previstos, vuelos] = await Promise.all([
    safe(() => api.get("/api/drones"), []),
    safe(() => api.get("/api/baterias"), []),
    safe(() => api.get("/api/mantenimientos"), []),
    safe(() => api.get("/api/previstos"), []),
    safe(() => api.get("/api/vuelos"), []),
  ]);

  const totalDrones = drones.length;
  const enMant     = drones.filter(d => (d.estado || "").toLowerCase().includes("mantenimiento")).length;
  const enServicio = drones.filter(d => (d.estado || "").toLowerCase().includes("servicio") && !d.estado.toLowerCase().includes("mantenimiento") && !d.estado.toLowerCase().includes("fuera")).length;
  const batBaja    = baterias.filter(b => Number(b.ciclos_de_carga || 0) > 200).length;

  document.getElementById("stats-slot").innerHTML = `
    <div class="stats__cell">
      <div>
        <div class="stats__value">${totalDrones}</div>
        <div class="stats__label">Drones</div>
      </div>
      <div class="stats__trend">${enServicio} en servicio</div>
    </div>
    <div class="stats__cell">
      <div>
        <div class="stats__value">${enMant}</div>
        <div class="stats__label">En mantenimiento</div>
      </div>
      <div class="stats__trend stats__trend--down">requieren atencion</div>
    </div>
    <div class="stats__cell">
      <div>
        <div class="stats__value">${baterias.length}</div>
        <div class="stats__label">Baterias</div>
      </div>
      <div class="stats__trend ${batBaja ? "stats__trend--down" : ""}">${batBaja} ciclos altos</div>
    </div>
    <div class="stats__cell">
      <div>
        <div class="stats__value">${vuelos.length}</div>
        <div class="stats__label">Vuelos registrados</div>
      </div>
      <div class="stats__trend">${previstos.length} previstos</div>
    </div>
  `;

  // Flota
  const fleetSlot = document.getElementById("fleet-slot");
  if (!drones.length) {
    fleetSlot.innerHTML = `<p class="dim">Sin drones registrados.</p>`;
  } else {
    fleetSlot.innerHTML = `
      <div class="col" style="gap:0">
        ${drones.slice(0, 5).map(d => `
          <a class="row between" href="#/drones/${d.id_dron}" style="padding:var(--space-2) 0;border-bottom:1px solid var(--outline-variant)">
            <div>
              <div class="list__primary">${d.matricula || "—"}</div>
              <div class="list__secondary">${d.nombre_modelo || ""} · ${d.numero_de_serie || ""} · ${d.horas_vuelo_acum || 0}h</div>
            </div>
            ${chipForEstado(d.estado)}
          </a>
        `).join("")}
      </div>
      <a class="btn btn--secondary btn--sm mt-2" href="#/drones">VER TODO →</a>
    `;
  }

  // Previstos
  const pSlot = document.getElementById("recent-flights-slot");
  if (!vuelos.length) {
    pSlot.innerHTML = `<p class="dim">Sin vuelos registrados.</p>`;
  } else {
    pSlot.innerHTML = `
      <div class="col" style="gap:0">
        ${vuelos.slice(0, 5).map(v => `
          <a class="row between" href="#/vuelos/${v.id_vuelo}" style="padding:var(--space-2) 0;border-bottom:1px solid var(--outline-variant);text-decoration:none;color:inherit">
            <div style="min-width:0;flex:1">
              <div class="list__primary" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.proposito || "Vuelo"}</div>
              <div class="list__secondary">${formatDate(v.fecha)} · ${v.tiempo_de_vuelo || "—"}</div>
            </div>
            <span class="chip chip--safe"><span class="chip__dot"></span>${(v.estado || "REALIZADO").toUpperCase()}</span>
          </a>
        `).join("")}
      </div>
      <a class="btn btn--secondary btn--sm mt-2" href="#/vuelos">VER TODO →</a>
    `;
  }

  // Baterias
  const bSlot = document.getElementById("battery-slot");
  if (!baterias.length) {
    bSlot.innerHTML = `<p class="dim" style="padding:var(--space-3)">Sin baterias registradas.</p>`;
  } else {
    bSlot.innerHTML = `
      <div class="list" style="border:0">
        ${baterias.slice(0, 8).map(b => {
          const ciclos = Number(b.ciclos_de_carga || 0);
          const pct = Math.min(100, (ciclos / 3000) * 100);
          return `
            <div class="list__row" style="grid-template-columns: 1fr 100px 2fr auto">
              <div>
                <div class="list__primary">${b.numero_de_serie || "—"}</div>
                <div class="list__secondary">${b.capacidad || "?"} mAh · ${b.voltage || "?"}V</div>
              </div>
              <div class="telemetry" style="align-items:flex-end">
                <span class="telemetry__value">${ciclos}</span>
                <span class="telemetry__label">CICLOS</span>
              </div>
              <div>${segBar(pct)}</div>
              <span class="chip chip--dim"><span class="chip__dot"></span>${b.estado || "—"}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Mantenimientos recientes
  const mantSlot = document.getElementById("mant-slot");
  if (!mantenimientos.length) {
    mantSlot.innerHTML = `<p class="dim">Sin mantenimientos registrados.</p>`;
  } else {
    mantSlot.innerHTML = `
      <div class="col" style="gap:0">
        ${mantenimientos.slice(0, 5).map(m => `
          <a class="row between" href="#/mantenimientos/${m.id_mantenimiento}" style="padding:var(--space-2) 0;border-bottom:1px solid var(--outline-variant);text-decoration:none;color:inherit">
            <div style="min-width:0;flex:1">
              <div class="list__primary" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.tipo || "—"}</div>
              <div class="list__secondary">${formatDate(m.fecha)}</div>
            </div>
            <span class="chip ${(m.tipo || "").toLowerCase().includes("correctivo") ? "chip--alert" : (m.tipo || "").toLowerCase().includes("preventivo") ? "chip--safe" : "chip--info"}"><span class="chip__dot"></span>${(m.tipo || "—").toUpperCase()}</span>
          </a>
        `).join("")}
      </div>
      <a class="btn btn--secondary btn--sm mt-2" href="#/mantenimientos">VER TALLER →</a>
    `;
  }

  // Proximas misiones
  const prevSlot = document.getElementById("prev-slot");
  if (!previstos.length) {
    prevSlot.innerHTML = `<p class="dim">Sin misiones programadas.</p>`;
  } else {
    prevSlot.innerHTML = `
      <div class="col" style="gap:0">
        ${previstos.slice(0, 5).map(p => `
          <a class="row between" href="#/previstos/${p.id_previstos}" style="padding:var(--space-2) 0;border-bottom:1px solid var(--outline-variant);text-decoration:none;color:inherit">
            <div style="min-width:0;flex:1">
              <div class="list__primary" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.nombre_clave || "—"}</div>
              <div class="list__secondary">${formatDate(p.fecha_inicio)}</div>
            </div>
            <span class="chip ${(p.previstoscol || "").toLowerCase().includes("curso") ? "chip--info" : "chip--dim"}"><span class="chip__dot"></span>${(p.previstoscol || "—").toUpperCase()}</span>
          </a>
        `).join("")}
      </div>
      <a class="btn btn--secondary btn--sm mt-2" href="#/previstos">VER AGENDA →</a>
    `;
  }
};
