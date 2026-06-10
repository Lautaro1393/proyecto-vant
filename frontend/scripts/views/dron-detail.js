import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toISOString().slice(0, 10);
};

const chipForEstado = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("mantenimiento")) return `<span class="chip chip--alert"><span class="chip__dot"></span>EN MANTENIMIENTO</span>`;
  if (e.includes("disponible"))    return `<span class="chip chip--safe"><span class="chip__dot"></span>DISPONIBLE</span>`;
  if (e.includes("vuelo"))         return `<span class="chip chip--info"><span class="chip__dot"></span>EN VUELO</span>`;
  return `<span class="chip chip--dim"><span class="chip__dot"></span>${estado || "—"}</span>`;
};

const confirm = (msg) => window.confirm(msg);

export const renderDronDetail = async (root, id) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "05",
    title: "DRON",
    id: `MOD-${id}`,
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/drones" style="align-self:flex-start">← VOLVER A FLOTA</a>
    <div class="card" id="hero">
      <div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando dron...</span>
      </div>
    </div>
    <div id="tel-grid"></div>
    <div id="modulos"></div>
  `;

  const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const [dron, vuelos, mant] = await Promise.all([
    safe(() => api.get(`/api/drones/${id}`)),
    safe(() => api.get("/api/vuelos"), []),
    safe(() => api.get("/api/mantenimientos"), []),
  ]);

  if (!dron) {
    main.querySelector("#hero").innerHTML = `
      <div class="card__body error-banner">DRON NO ENCONTRADO</div>
    `;
    return;
  }

  const imgSrc = dron.imagen ? `/uploads/${dron.imagen}` : null;
  const vuelosDelDron = vuelos.filter(v => Number(v.dron_id) === Number(id)).slice(0, 5);
  const mantDelDron   = mant.filter(m => Number(m.dron_id) === Number(id)).slice(0, 5);

  main.querySelector("#hero").innerHTML = `
    <div class="card__body card__body--flush">
      <div class="drone-hero">
        ${imgSrc
          ? `<img class="drone-hero__img" src="${imgSrc}" alt="${dron.matricula}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"/>`
          : ""
        }
        <div class="drone-hero__placeholder" ${imgSrc ? 'style="display:none"' : ""}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="64" height="64">
            <circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/>
            <circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/>
            <line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
      </div>
      <div style="padding:var(--space-3)">
        <div class="row between mb-2">
          <div>
            <h1 class="h2">${dron.matricula || "—"}</h1>
            <p class="dim">${dron.nombre_modelo || ""} · ${dron.fabricante || ""}</p>
          </div>
          ${chipForEstado(dron.estado)}
        </div>
        <div class="row" style="gap:var(--space-3);flex-wrap:wrap">
          <span class="label-caps">SN ${dron.numero_serie || "—"}</span>
          <span class="label-caps">PILOTO ${dron.nombre_piloto || "—"} ${dron.apellido_piloto || ""}</span>
        </div>
      </div>
    </div>
  `;

  main.querySelector("#tel-grid").innerHTML = `
    <div class="stats mt-3">
      <div class="stats__cell">
        <div>
          <div class="stats__value">${dron.horas_vuelo_acum || 0}<span style="font-size:12px;color:var(--on-surface-dim);margin-left:2px">h</span></div>
          <div class="stats__label">HORAS ACUM</div>
        </div>
        <div class="stats__trend">vuelos</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${vuelosDelDron.length}</div>
          <div class="stats__label">VUELOS</div>
        </div>
        <div class="stats__trend">registrados</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${formatDate(dron.fecha_mantenimiento)}</div>
          <div class="stats__label">ULT MANT</div>
        </div>
        <div class="stats__trend">${mantDelDron.length} totales</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${formatDate(dron.fecha_adquisicion)}</div>
          <div class="stats__label">ADQUIRIDO</div>
        </div>
        <div class="stats__trend">en flota</div>
      </div>
    </div>
  `;

  main.querySelector("#modulos").innerHTML = `
    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">07</span> VUELOS RECIENTES</span>
        <span class="card__header-id">MOD-07</span>
      </header>
      <div class="card__body card__body--flush">
        ${vuelosDelDron.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN VUELOS REGISTRADOS</div>`
          : `<div class="list" style="border:0">
              ${vuelosDelDron.map(v => `
                <div class="list__row" style="grid-template-columns: 1fr auto">
                  <div>
                    <div class="list__primary">${v.proposito || "Vuelo"}</div>
                    <div class="list__secondary">${formatDate(v.fecha)} · ${v.coordenadas || "—"}</div>
                  </div>
                  <span class="chip chip--info"><span class="chip__dot"></span>${v.tiempo_de_vuelo || "—"}</span>
                </div>
              `).join("")}
            </div>`
        }
      </div>
    </article>

    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">08</span> MANTENIMIENTOS</span>
        <span class="card__header-id">MOD-08</span>
      </header>
      <div class="card__body card__body--flush">
        ${mantDelDron.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN MANTENIMIENTOS</div>`
          : `<div class="list" style="border:0">
              ${mantDelDron.map(m => `
                <div class="list__row" style="grid-template-columns: 1fr auto">
                  <div>
                    <div class="list__primary">${m.tipo || m.descripcion || "Mantenimiento"}</div>
                    <div class="list__secondary">${formatDate(m.fecha)}</div>
                  </div>
                  <span class="chip chip--caution"><span class="chip__dot"></span>${m.estado || "—"}</span>
                </div>
              `).join("")}
            </div>`
        }
      </div>
    </article>

    ${dron.observaciones ? `
      <article class="card mt-3">
        <header class="card__header">
          <span><span class="card__header-prefix">09</span> OBSERVACIONES</span>
          <span class="card__header-id">MOD-09</span>
        </header>
        <div class="card__body">
          <p>${dron.observaciones}</p>
        </div>
      </article>
    ` : ""}

    ${isAdmin ? `
      <article class="card mt-3 card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">10</span> ACCIONES</span>
          <span class="card__header-id">ADMIN</span>
        </header>
        <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
          <a class="btn btn--secondary" href="#/drones/${id}/edit">EDITAR DRON</a>
          <button class="btn btn--secondary" id="btn-mant">PASAR A MANTENIMIENTO</button>
          <button class="btn btn--danger" id="btn-delete">DAR DE BAJA (SOFT DELETE)</button>
        </div>
      </article>
    ` : ""}
  `;

  if (isAdmin) {
    const btnMant = main.querySelector("#btn-mant");
    const btnDel  = main.querySelector("#btn-delete");
    if (btnMant) btnMant.addEventListener("click", () => cambiarEstado(id, "En Mantenimiento", "ENVIAR A MANTENIMIENTO?"));
    if (btnDel)  btnDel.addEventListener("click",  () => borrarDron(id));
  }
};

const cambiarEstado = async (id, estado, msg) => {
  if (!confirm(msg)) return;
  try {
    await api.put(`/api/drones/${id}`, { estado });
    navigate(`/drones/${id}`);
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
};

const borrarDron = async (id) => {
  if (!confirm("DAR DE BAJA este dron? (soft delete, se puede restaurar)")) return;
  try {
    await api.del(`/api/drones/${id}`);
    navigate("/drones");
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
};
