import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { formatDate } from "../ui-helpers.js";

const confirm = (msg) => window.confirm(msg);

const tipoChip = (tipo) => {
  const t = (tipo || "").toLowerCase();
  if (t.includes("correctivo")) return "chip--alert";
  if (t.includes("firmware") || t.includes("calibracion")) return "chip--info";
  if (t.includes("preventivo")) return "chip--safe";
  return "chip--dim";
};

const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

export const renderMantenimientoDetail = async (root, id) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "23",
    title: "MANTENIMIENTO",
    id: `MOD-${id}`,
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/mantenimientos" style="align-self:flex-start">← VOLVER AL TALLER</a>
    <div class="card" id="hero">
      <div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando mantenimiento...</span>
      </div>
    </div>
    <div id="tel-grid"></div>
    <div id="modulos"></div>
  `;

  const m = await safe(() => api.get(`/api/mantenimientos/${id}`));
  if (!m) {
    main.querySelector("#hero").innerHTML = `<div class="card__body error-banner">MANTENIMIENTO NO ENCONTRADO</div>`;
    return;
  }

  main.querySelector("#hero").innerHTML = `
    <div class="card__body">
      <div class="row between mb-2" style="gap:var(--space-2);align-items:flex-start">
        <div style="flex:1;min-width:0">
          <h1 class="h2" style="word-break:break-word">${m.tipo || "Mantenimiento"}</h1>
          <p class="dim">${formatDate(m.fecha)}${m.dron_matricula ? " · " + m.dron_matricula : ""}</p>
        </div>
        <span class="chip ${tipoChip(m.tipo)}"><span class="chip__dot"></span>${(m.tipo || "—").toUpperCase()}</span>
      </div>
      <p style="white-space:pre-wrap">${m.descripcion || "—"}</p>
    </div>
  `;

  main.querySelector("#tel-grid").innerHTML = `
    <div class="stats mt-3">
      <div class="stats__cell">
        <div>
          <div class="stats__value">$${Number(m.costo || 0).toLocaleString("es-AR")}</div>
          <div class="stats__label">COSTO</div>
        </div>
        <div class="stats__trend">ARS</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value">${m.horas_de_vuelo || 0}<span style="font-size:12px;color:var(--on-surface-dim);margin-left:2px">h</span></div>
          <div class="stats__label">HORAS DRON</div>
        </div>
        <div class="stats__trend">al momento</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:18px">${m.dron_matricula || "—"}</div>
          <div class="stats__label">DRON</div>
        </div>
        <div class="stats__trend">${m.dron_serie ? "SN " + m.dron_serie : ""}</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:18px">${m.bateria_serie || "—"}</div>
          <div class="stats__label">BATERIA</div>
        </div>
        <div class="stats__trend">asociada</div>
      </div>
    </div>
  `;

  main.querySelector("#modulos").innerHTML = `
    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">22</span> DETALLE TECNICO</span>
        <span class="card__header-id">MOD-22·01</span>
      </header>
      <div class="card__body">
        <div class="grid-2">
          <div><span class="dim text-sm">ID</span><div>${m.id_mantenimiento}</div></div>
          <div><span class="dim text-sm">Fecha</span><div>${formatDate(m.fecha)}</div></div>
          <div><span class="dim text-sm">Tipo</span><div>${m.tipo || "—"}</div></div>
          <div><span class="dim text-sm">Dron ID</span><div>${m.dron_id}</div></div>
          <div><span class="dim text-sm">Bateria ID</span><div>${m.fk_bateria_id || "—"}</div></div>
          <div><span class="dim text-sm">Horas al mantenimiento</span><div>${m.horas_de_vuelo || 0} h</div></div>
        </div>
      </div>
    </article>

    ${isAdmin ? `
      <article class="card mt-3 card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">23</span> ACCIONES</span>
          <span class="card__header-id">ADMIN</span>
        </header>
        <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
          <a class="btn btn--secondary" href="#/mantenimientos/${id}/edit">EDITAR MANTENIMIENTO</a>
          <button class="btn btn--danger" id="btn-delete">ELIMINAR REGISTRO</button>
          <div id="delete-error"></div>
        </div>
      </article>
    ` : ""}
  `;

  if (isAdmin) {
    const btnDel = main.querySelector("#btn-delete");
    if (btnDel) btnDel.addEventListener("click", () => borrarMantenimiento(id));
  }
};

const borrarMantenimiento = async (id) => {
  if (!confirm("ELIMINAR este registro de mantenimiento? (no afecta el estado del dron)")) return;
  const btn = document.getElementById("btn-delete");
  const errSlot = document.getElementById("delete-error");
  if (errSlot) errSlot.innerHTML = "";
  if (btn) { btn.disabled = true; btn.textContent = "ELIMINANDO..."; }
  try {
    await api.del(`/api/mantenimientos/${id}`);
    navigate("/mantenimientos");
  } catch (e) {
    if (errSlot) errSlot.innerHTML = `<div class="error-banner">${e.message || "Error al eliminar"}</div>`;
    if (btn) { btn.disabled = false; btn.textContent = "ELIMINAR REGISTRO"; }
  }
};
