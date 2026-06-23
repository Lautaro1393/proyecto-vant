import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";

const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

const validate = (f) => {
  const e = [];
  if (!f.modelo?.trim()) e.push("Modelo requerido");
  if (!f.fabricante?.trim()) e.push("Fabricante requerido");
  if (f.modelo && f.modelo.length > 45) e.push("Modelo max 45 caracteres");
  if (f.fabricante && f.fabricante.length > 45) e.push("Fabricante max 45 caracteres");
  return e;
};

export const renderModelosForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/modelos");
    return;
  }

  const isEdit = !!opts.id;
  const existente = isEdit ? await safe(() => api.get(`/api/modelos/${opts.id}`)) : null;
  if (isEdit && !existente) {
    root.innerHTML = renderShell({
      titlePrefix: "29",
      title: "EDITAR MODELO",
      id: "MOD-29",
      user,
    });
    const main = bindShell(root, user);
    main.innerHTML = `<a class="btn btn--ghost btn--sm" href="#/modelos" style="align-self:flex-start">← VOLVER</a><div class="card mt-3"><div class="card__body error-banner">MODELO NO ENCONTRADO</div></div>`;
    return;
  }

  root.innerHTML = renderShell({
    titlePrefix: "29",
    title: isEdit ? "EDITAR MODELO" : "NUEVO MODELO",
    id: "MOD-29",
    user,
  });
  const main = bindShell(root, user);
  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/modelos" style="align-self:flex-start">← CANCELAR</a>
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">29</span> ${isEdit ? "EDITAR MODELO" : "NUEVO MODELO"}
        <span class="section-head__id">MOD-29</span>
      </div>
    </header>
    <div id="msg"></div>
    <form id="modelo-form" class="stack" autocomplete="off" novalidate>
      <div class="field">
        <label class="field__label" for="modelo">Modelo *</label>
        <div class="input-wrap">
          <input class="input" id="modelo" name="modelo" required maxlength="45" placeholder="Ej: Matrice 3T" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="fabricante">Fabricante *</label>
        <div class="input-wrap">
          <input class="input" id="fabricante" name="fabricante" required maxlength="45" placeholder="Ej: DJI" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>

      ${isEdit ? `
        <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
          <a class="btn btn--secondary btn--block" href="#/modelos">CANCELAR</a>
          <button type="button" class="btn btn--danger btn--block" id="btn-delete">ELIMINAR MODELO</button>
          <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">GUARDAR CAMBIOS</button>
        </div>
      ` : `
        <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
          <a class="btn btn--secondary btn--block" href="#/modelos">CANCELAR</a>
          <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">CREAR MODELO</button>
        </div>
      `}
    </form>
    <div id="delete-error"></div>
  `;

  if (isEdit) {
    main.querySelector("#modelo").value = existente.modelo || "";
    main.querySelector("#fabricante").value = existente.fabricante || "";
  }

  const form = main.querySelector("#modelo-form");
  const msg = main.querySelector("#msg");
  const btn = main.querySelector("#btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const data = Object.fromEntries(new FormData(form));
    const errs = validate(data);
    if (errs.length) {
      msg.innerHTML = `<div class="error-banner">${errs.join(" · ")}</div>`;
      return;
    }
    btn.disabled = true;
    btn.textContent = isEdit ? "GUARDANDO..." : "CREANDO...";
    try {
      await (isEdit ? api.put(`/api/modelos/${opts.id}`, data) : api.post("/api/modelos", data));
      navigate("/modelos");
    } catch (err) {
      const detail = (err.body && err.body.error) || err.message || "Error desconocido";
      msg.innerHTML = `<div class="error-banner">${detail}</div>`;
      btn.disabled = false;
      btn.textContent = isEdit ? "GUARDAR CAMBIOS" : "CREAR MODELO";
    }
  });

  if (isEdit) {
    const btnDel = main.querySelector("#btn-delete");
    if (btnDel) btnDel.addEventListener("click", () => borrarModelo(opts.id));
  }
};

const borrarModelo = async (id) => {
  if (!confirm("ELIMINAR este modelo? (no se puede si hay drones usandolo)")) return;
  const btn = document.getElementById("btn-delete");
  const errSlot = document.getElementById("delete-error");
  if (errSlot) errSlot.innerHTML = "";
  if (btn) { btn.disabled = true; btn.textContent = "ELIMINANDO..."; }
  try {
    await api.del(`/api/modelos/${id}`);
    navigate("/modelos");
  } catch (e) {
    const detail = (e.body && e.body.error) || e.message || "Error al eliminar";
    if (errSlot) errSlot.innerHTML = `<div class="error-banner">${detail}</div>`;
    if (btn) { btn.disabled = false; btn.textContent = "ELIMINAR MODELO"; }
  }
};
