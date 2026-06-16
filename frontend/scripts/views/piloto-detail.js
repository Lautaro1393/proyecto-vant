import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { chipForRol, chipForCMA, initials, formatDate } from "../ui-helpers.js";

const confirm = (msg) => window.confirm(msg);

export const renderPilotoDetail = async (root, id) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "12",
    title: "PILOTO",
    id: `MOD-${id}`,
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/pilotos" style="align-self:flex-start">← VOLVER A CREW</a>
    <div class="card" id="hero">
      <div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando piloto...</span>
      </div>
    </div>
    <div id="tel-grid"></div>
    <div id="modulos"></div>
  `;

  const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const [piloto, vuelos, drones] = await Promise.all([
    safe(() => api.get(`/api/pilotos/${id}`)),
    safe(() => api.get("/api/vuelos"), []),
    safe(() => api.get("/api/drones"), []),
  ]);

  if (!piloto) {
    main.querySelector("#hero").innerHTML = `
      <div class="card__body error-banner">PILOTO NO ENCONTRADO</div>
    `;
    return;
  }

  const ini = initials(piloto.nombre, piloto.apellido);
  const fullName = `${piloto.nombre || ""} ${piloto.apellido || ""}`.trim() || piloto.email || `Piloto #${piloto.id_pilotos}`;
  const vuelosDelPiloto = vuelos.filter(v =>
    Array.isArray(v.pilotos) && v.pilotos.map(Number).includes(Number(id))
  ).slice(0, 5);
  const dronesAsignados = drones.filter(d => Number(d.piloto_id) === Number(id));

  main.querySelector("#hero").innerHTML = `
    <div class="card__body card__body--flush">
      <div class="drone-hero">
        <div class="drone-hero__placeholder">
          <span class="avatar avatar--xl">${ini}</span>
        </div>
      </div>
      <div style="padding:var(--space-3)">
        <div class="row between mb-2">
          <div>
            <h1 class="h2">${fullName}</h1>
            <p class="dim">DNI ${piloto.dni || "—"} · ${piloto.email || ""}</p>
          </div>
          ${chipForRol(piloto.rol)}
        </div>
        <div class="row" style="gap:var(--space-3);flex-wrap:wrap">
          <span class="label-caps">CMA ${piloto.certificacion || "—"}</span>
          <span class="label-caps">CONTACTO ${piloto.contacto || "—"}</span>
        </div>
      </div>
    </div>
  `;

  main.querySelector("#tel-grid").innerHTML = `
    <div class="stats mt-3">
      <div class="stats__cell">
        <div>
          <div class="stats__value">${piloto.horas_vuelo_acum || 0}<span style="font-size:12px;color:var(--on-surface-dim);margin-left:2px">h</span></div>
          <div class="stats__label">HORAS ACUM</div>
        </div>
        <div class="stats__trend">vuelos</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${vuelosDelPiloto.length}</div>
          <div class="stats__label">VUELOS</div>
        </div>
        <div class="stats__trend">registrados</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${dronesAsignados.length}</div>
          <div class="stats__label">DRONES</div>
        </div>
        <div class="stats__trend">asignados</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${formatDate(piloto.vencimiento_cma)}</div>
          <div class="stats__label">VTO CMA</div>
        </div>
        <div class="stats__trend">${chipForCMA(piloto.vencimiento_cma).match(/CMA\s+([^<]+)/)?.[1] || "—"}</div>
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
        ${vuelosDelPiloto.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN VUELOS REGISTRADOS</div>`
          : `<div class="list" style="border:0">
              ${vuelosDelPiloto.map(v => `
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
        <span><span class="card__header-prefix">08</span> DRONES ASIGNADOS</span>
        <span class="card__header-id">MOD-08</span>
      </header>
      <div class="card__body card__body--flush">
        ${dronesAsignados.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN DRONES ASIGNADOS</div>`
          : `<div class="list" style="border:0">
              ${dronesAsignados.map(d => `
                <a class="list__row" href="#/drones/${d.id_dron}" style="grid-template-columns: 1fr auto; text-decoration:none; color:inherit">
                  <div>
                    <div class="list__primary">${d.matricula || "—"}</div>
                    <div class="list__secondary">${d.nombre_modelo || ""} · SN ${d.numero_serie || "—"}</div>
                  </div>
                  <span class="chip chip--safe"><span class="chip__dot"></span>${d.estado || "—"}</span>
                </a>
              `).join("")}
            </div>`
        }
      </div>
    </article>

    ${isAdmin ? `
      <article class="card mt-3 card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">10</span> ACCIONES</span>
          <span class="card__header-id">ADMIN</span>
        </header>
        <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
          <a class="btn btn--secondary" href="#/pilotos/${id}/edit">EDITAR PILOTO</a>
          <button class="btn btn--danger" id="btn-delete">DAR DE BAJA (SOFT DELETE)</button>
        </div>
      </article>
    ` : ""}
  `;

  if (isAdmin) {
    const btnDel = main.querySelector("#btn-delete");
    if (btnDel) btnDel.addEventListener("click", () => borrarPiloto(id));
  }
};

const borrarPiloto = async (id) => {
  if (!confirm("DAR DE BAJA este piloto? (soft delete, se puede restaurar)")) return;
  try {
    await api.del(`/api/pilotos/${id}`);
    navigate("/pilotos");
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
};
