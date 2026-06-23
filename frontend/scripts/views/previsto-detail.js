import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { formatDate } from "../ui-helpers.js";

const confirm = (msg) => window.confirm(msg);

const estadoChip = (e) => {
  const v = (e || "").toLowerCase();
  if (v.includes("curso"))      return "chip--info";
  if (v.includes("finalizado")) return "chip--safe";
  if (v.includes("pospuesto")) return "chip--caution";
  if (v.includes("cancelado")) return "chip--alert";
  return "chip--dim";
};

const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

export const renderPrevistoDetail = async (root, id) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "26",
    title: "PREVISTO",
    id: `MOD-${id}`,
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/previstos" style="align-self:flex-start">← VOLVER A AGENDA</a>
    <div class="card" id="hero">
      <div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando mision...</span>
      </div>
    </div>
    <div id="tel-grid"></div>
    <div id="modulos"></div>
  `;

  const p = await safe(() => api.get(`/api/previstos/${id}`));
  if (!p) {
    main.querySelector("#hero").innerHTML = `<div class="card__body error-banner">MISION NO ENCONTRADA</div>`;
    return;
  }

  main.querySelector("#hero").innerHTML = `
    <div class="card__body">
      <div class="row between mb-2" style="gap:var(--space-2);align-items:flex-start">
        <div style="flex:1;min-width:0">
          <h1 class="h2" style="word-break:break-word">${p.nombre_clave || "—"}</h1>
          <p class="dim">${formatDate(p.fecha_inicio)} → ${formatDate(p.fecha_fin)}</p>
        </div>
        <span class="chip ${estadoChip(p.previstoscol)}"><span class="chip__dot"></span>${(p.previstoscol || "—").toUpperCase()}</span>
      </div>
      <p style="white-space:pre-wrap">${p.descripcion || "—"}</p>
    </div>
  `;

  main.querySelector("#tel-grid").innerHTML = `
    <div class="stats mt-3">
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${formatDate(p.fecha_inicio)}</div>
          <div class="stats__label">FECHA INICIO</div>
        </div>
        <div class="stats__trend">inicio</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${formatDate(p.fecha_fin)}</div>
          <div class="stats__label">FECHA FIN</div>
        </div>
        <div class="stats__trend">cierre</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${p.solicitante || "—"}</div>
          <div class="stats__label">SOLICITANTE</div>
        </div>
        <div class="stats__trend">requirente</div>
      </div>
      <div class="stats__cell">
        <div>
          <div class="stats__value" style="font-size:16px">${(p.previstoscol || "—").toUpperCase()}</div>
          <div class="stats__label">ESTADO</div>
        </div>
        <div class="stats__trend">actual</div>
      </div>
    </div>
  `;

  main.querySelector("#modulos").innerHTML = `
    <article class="card mt-3">
      <header class="card__header">
        <span><span class="card__header-prefix">25</span> DETALLE DE MISION</span>
        <span class="card__header-id">MOD-25·01</span>
      </header>
      <div class="card__body">
        <div class="grid-2">
          <div><span class="dim text-sm">ID</span><div>${p.id_previstos}</div></div>
          <div><span class="dim text-sm">Nombre clave</span><div>${p.nombre_clave || "—"}</div></div>
          <div><span class="dim text-sm">Solicitante</span><div>${p.solicitante || "—"}</div></div>
          <div><span class="dim text-sm">Estado</span><div>${p.previstoscol || "—"}</div></div>
        </div>
      </div>
    </article>

    ${isAdmin ? `
      <article class="card mt-3 card--alert">
        <header class="card__header">
          <span><span class="card__header-prefix">26</span> ACCIONES</span>
          <span class="card__header-id">ADMIN</span>
        </header>
        <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
          <a class="btn btn--secondary" href="#/previstos/${id}/edit">EDITAR MISION</a>
          <button class="btn btn--danger" id="btn-delete">CANCELAR MISION (SOFT DELETE)</button>
          <div id="delete-error"></div>
        </div>
      </article>
    ` : ""}
  `;

  if (isAdmin) {
    const btnDel = main.querySelector("#btn-delete");
    if (btnDel) btnDel.addEventListener("click", () => borrarPrevisto(id));
  }
};

const borrarPrevisto = async (id) => {
  if (!confirm("CANCELAR esta mision? (soft delete)")) return;
  const btn = document.getElementById("btn-delete");
  const errSlot = document.getElementById("delete-error");
  if (errSlot) errSlot.innerHTML = "";
  if (btn) { btn.disabled = true; btn.textContent = "CANCELANDO..."; }
  try {
    await api.del(`/api/previstos/${id}`);
    navigate("/previstos");
  } catch (e) {
    if (errSlot) errSlot.innerHTML = `<div class="error-banner">${e.message || "Error al cancelar"}</div>`;
    if (btn) { btn.disabled = false; btn.textContent = "CANCELAR MISION (SOFT DELETE)"; }
  }
};
