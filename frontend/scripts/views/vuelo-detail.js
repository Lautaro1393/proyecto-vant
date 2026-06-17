import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { segBar, formatDate } from "../ui-helpers.js";

const confirm = (msg) => window.confirm(msg);

const estadoChip = (estado) => {
  const e = (estado || "Realizado").toLowerCase();
  if (e === "realizado") return "chip--safe";
  if (e === "cancelado") return "chip--alert";
  if (e === "abortado")  return "chip--caution";
  return "chip--dim";
};

const climaChip = (clima) => {
  const c = (clima || "").toLowerCase();
  if (c.includes("fuerte") || c.includes("niebla")) return "chip--caution";
  if (c.includes("lluvia") || c.includes("nublado") || c.includes("viento")) return "chip--info";
  return "chip--safe";
};

export const renderVueloDetail = async (root, id) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "15",
    title: "VUELO",
    id: `MOD-${id}`,
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/vuelos" style="align-self:flex-start">← VOLVER A OPERACIONES</a>
    <div class="card" id="hero">
      <div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando vuelo...</span>
      </div>
    </div>
    <div id="tel-grid"></div>
    <div id="modulos"></div>
  `;

  const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const vuelo = await safe(() => api.get(`/api/vuelos/${id}`));

  if (!vuelo) {
    main.querySelector("#hero").innerHTML = `
      <div class="card__body error-banner">VUELO NO ENCONTRADO</div>
    `;
    return;
  }

  const estado = vuelo.estado || "Realizado";
  const clima = vuelo.clima || "—";

  main.querySelector("#hero").innerHTML = `
    <div class="card__body">
      <div class="row between mb-2" style="gap:var(--space-2);align-items:flex-start">
        <div style="flex:1;min-width:0">
          <h1 class="h2" style="word-break:break-word">${vuelo.proposito || "—"}</h1>
          <p class="dim">${formatDate(vuelo.fecha)} · ${vuelo.coordenadas || "—"}</p>
        </div>
        <span class="chip ${estadoChip(estado)}"><span class="chip__dot"></span>${estado.toUpperCase()}</span>
      </div>
      <div class="row" style="gap:var(--space-3);flex-wrap:wrap">
        <span class="label-caps">TIEMPO ${vuelo.tiempo_de_vuelo || "—"}</span>
        <span class="chip ${climaChip(clima)}"><span class="chip__dot"></span>${clima.toUpperCase()}</span>
      </div>
    </div>
  `;

  main.querySelector("#tel-grid").innerHTML = `
    <div class="stats mt-3">
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:20px">${vuelo.tiempo_de_vuelo || "—"}</div>
          <div class="stats__label">TIEMPO</div>
        </div>
        <div class="stats__trend">hh:mm:ss</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${vuelo.drones.length}</div>
          <div class="stats__label">DRONES</div>
        </div>
        <div class="stats__trend">asignados</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${vuelo.baterias.length}</div>
          <div class="stats__label">BATERIAS</div>
        </div>
        <div class="stats__trend">en uso</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${vuelo.pilotos.length}</div>
          <div class="stats__label">PILOTOS</div>
        </div>
        <div class="stats__trend">en cabina</div>
      </div>
    </div>
  `;

  main.querySelector("#modulos").innerHTML = `
    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">17</span> DRONES</span>
        <span class="card__header-id">MOD-17</span>
      </header>
      <div class="card__body card__body--flush">
        ${vuelo.drones.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN DRONES ASIGNADOS</div>`
          : `<div class="list" style="border:0">
              ${vuelo.drones.map(d => `
                <a class="list__row" href="#/drones/${d.id_dron}" style="grid-template-columns: 1fr auto; text-decoration:none; color:inherit">
                  <div>
                    <div class="list__primary">${d.matricula || "—"}</div>
                    <div class="list__secondary">SN ${d.numero_de_serie || "—"}</div>
                  </div>
                  <span class="chip chip--info"><span class="chip__dot"></span>DRON</span>
                </a>
              `).join("")}
            </div>`
        }
      </div>
    </article>

    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">18</span> BATERIAS</span>
        <span class="card__header-id">MOD-18</span>
      </header>
      <div class="card__body card__body--flush">
        ${vuelo.baterias.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN BATERIAS ASIGNADAS</div>`
          : `<div class="list" style="border:0">
              ${vuelo.baterias.map(b => {
                const ciclos = Number(b.ciclos_de_carga || 0);
                const pct = Math.min(100, (ciclos / 3000) * 100);
                return `
                  <div class="list__row" style="grid-template-columns: 1fr 80px 2fr auto">
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
            </div>`
        }
      </div>
    </article>

    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">19</span> PILOTOS</span>
        <span class="card__header-id">MOD-19</span>
      </header>
      <div class="card__body card__body--flush">
        ${vuelo.pilotos.length === 0
          ? `<div class="card__body dim" style="text-align:center;padding:var(--space-4)">SIN PILOTOS ASIGNADOS</div>`
          : `<div class="list" style="border:0">
              ${vuelo.pilotos.map(p => `
                <a class="list__row" href="#/pilotos/${p.id_pilotos}" style="grid-template-columns: 1fr auto; text-decoration:none; color:inherit">
                  <div>
                    <div class="list__primary">${(p.nombre || "") + " " + (p.apellido || "")}</div>
                    <div class="list__secondary">PILOTO #${p.id_pilotos}</div>
                  </div>
                  <span class="chip chip--olive"><span class="chip__dot"></span>CREW</span>
                </a>
              `).join("")}
            </div>`
        }
      </div>
    </article>

    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">20</span> UBICACION & CONDICIONES</span>
        <span class="card__header-id">MOD-20</span>
      </header>
      <div class="card__body">
        <div class="row between mb-2">
          <div>
            <div class="list__primary">COORDENADAS</div>
            <div class="dim text-sm">${vuelo.coordenadas || "—"}</div>
          </div>
          <div>
            <div class="list__primary">FECHA</div>
            <div class="dim text-sm">${formatDate(vuelo.fecha)}</div>
          </div>
        </div>
        <div class="row between">
          <div>
            <div class="list__primary">CLIMA</div>
            <div class="dim text-sm">${clima}</div>
          </div>
          <div>
            <div class="list__primary">TIEMPO</div>
            <div class="dim text-sm">${vuelo.tiempo_de_vuelo || "—"}</div>
          </div>
        </div>
        ${vuelo.observaciones ? `
          <div class="mt-3" style="border-top:1px solid var(--outline-variant);padding-top:var(--space-2)">
            <div class="list__primary">OBSERVACIONES</div>
            <p class="mt-1">${vuelo.observaciones}</p>
          </div>
        ` : ""}
      </div>
    </article>

    ${isAdmin ? `
      <article class="card mt-3 card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">21</span> ACCIONES</span>
          <span class="card__header-id">ADMIN</span>
        </header>
        <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
          <a class="btn btn--secondary" href="#/vuelos/${id}/edit">EDITAR VUELO</a>
          <button class="btn btn--danger" id="btn-delete">DAR DE BAJA (SOFT DELETE)</button>
        </div>
      </article>
    ` : ""}
  `;

  if (isAdmin) {
    const btnDel = main.querySelector("#btn-delete");
    if (btnDel) btnDel.addEventListener("click", () => borrarVuelo(id));
  }
};

const borrarVuelo = async (id) => {
  if (!confirm("DAR DE BAJA este vuelo? (soft delete, no resta acumuladores)")) return;
  try {
    await api.del(`/api/vuelos/${id}`);
    navigate("/vuelos");
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
};
