import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";

const ESTADOS = [
  { value: "Planificado", label: "PLANIFICADO" },
  { value: "En Curso",    label: "EN CURSO" },
  { value: "Finalizado",  label: "FINALIZADO" },
  { value: "Pospuesto",   label: "POSPUESTO" },
  { value: "Cancelado",   label: "CANCELADO" },
];

const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

const toDateTimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validate = (f, isEdit) => {
  const e = [];
  if (!f.nombre_clave?.trim()) e.push("Nombre clave requerido");
  if (f.nombre_clave && f.nombre_clave.length > 150) e.push("Nombre clave max 150 caracteres");
  if (!f.fecha_inicio) e.push("Fecha inicio requerida");
  if (!f.fecha_fin) e.push("Fecha fin requerida");
  if (f.fecha_inicio && f.fecha_fin && f.fecha_inicio > f.fecha_fin) e.push("Fecha fin debe ser posterior a fecha inicio");
  if (!f.solicitante?.trim()) e.push("Solicitante requerido");
  if (!f.previstoscol) e.push("Estado requerido");
  if (f.descripcion && f.descripcion.length > 450) e.push("Descripcion max 450 caracteres");
  return e;
};

const toBackendDateTime = (local) => {
  if (!local) return null;
  return local.replace("T", " ") + ":00";
};

export const renderPrevistosForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/previstos");
    return;
  }

  const isEdit = !!opts.id;

  root.innerHTML = renderShell({
    titlePrefix: "27",
    title: isEdit ? "EDITAR MISION" : "PLANIFICAR MISION",
    id: "MOD-27",
    user,
  });
  const main = bindShell(root, user);
  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="${isEdit ? `#/previstos/${opts.id}` : "#/previstos"}" style="align-self:flex-start">← CANCELAR</a>
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">27</span> ${isEdit ? "EDITAR MISION" : "PLANIFICAR MISION"}
        <span class="section-head__id">MOD-27</span>
      </div>
    </header>
    <div id="msg"></div>
    <form id="prev-form" class="stack" autocomplete="off" novalidate>
      <div class="field">
        <label class="field__label" for="nombre_clave">Nombre clave *</label>
        <div class="input-wrap">
          <input class="input" id="nombre_clave" name="nombre_clave" required maxlength="150" placeholder="Operacion Cóndor / Vigilancia perimetral / etc." />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field__label" for="descripcion">Descripcion</label>
        <textarea class="textarea" id="descripcion" name="descripcion" rows="3" maxlength="450" placeholder="Detalle de la mision..."></textarea>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="fecha_inicio">Fecha inicio *</label>
          <div class="input-wrap">
            <input class="input" id="fecha_inicio" name="fecha_inicio" type="datetime-local" required />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="fecha_fin">Fecha fin *</label>
          <div class="input-wrap">
            <input class="input" id="fecha_fin" name="fecha_fin" type="datetime-local" required />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="solicitante">Solicitante *</label>
          <div class="input-wrap">
            <input class="input" id="solicitante" name="solicitante" required maxlength="45" placeholder="Nombre del requirente" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="previstoscol">Estado *</label>
          <div class="input-wrap">
            <select class="select" id="previstoscol" name="previstoscol" required>
              ${ESTADOS.map((e) => `<option value="${e.value}">${e.label}</option>`).join("")}
            </select>
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
        <a class="btn btn--secondary btn--block" href="${isEdit ? `#/previstos/${opts.id}` : "#/previstos"}">CANCELAR</a>
        <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">${isEdit ? "GUARDAR CAMBIOS" : "PLANIFICAR MISION"}</button>
      </div>
    </form>
  `;

  const existente = isEdit ? await safe(() => api.get(`/api/previstos/${opts.id}`)) : null;
  if (isEdit && !existente) {
    main.innerHTML = `<a class="btn btn--ghost btn--sm" href="#/previstos" style="align-self:flex-start">← VOLVER</a><div class="card mt-3"><div class="card__body error-banner">MISION NO ENCONTRADA</div></div>`;
    return;
  }

  if (isEdit && existente) {
    main.querySelector("#nombre_clave").value = existente.nombre_clave || "";
    main.querySelector("#descripcion").value = existente.descripcion || "";
    main.querySelector("#fecha_inicio").value = toDateTimeLocal(existente.fecha_inicio);
    main.querySelector("#fecha_fin").value = toDateTimeLocal(existente.fecha_fin);
    main.querySelector("#solicitante").value = existente.solicitante || "";
    main.querySelector("#previstoscol").value = existente.previstoscol || "Planificado";
  } else {
    main.querySelector("#fecha_inicio").value = toDateTimeLocal(new Date().toISOString());
  }

  const form = main.querySelector("#prev-form");
  const msg = main.querySelector("#msg");
  const btn = main.querySelector("#btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const data = Object.fromEntries(new FormData(form));
    const errs = validate(data, isEdit);
    if (errs.length) {
      msg.innerHTML = `<div class="error-banner">${errs.join(" · ")}</div>`;
      return;
    }
    const payload = {
      nombre_clave: data.nombre_clave.trim(),
      descripcion: data.descripcion?.trim() || null,
      fecha_inicio: toBackendDateTime(data.fecha_inicio),
      fecha_fin: toBackendDateTime(data.fecha_fin),
      solicitante: data.solicitante.trim(),
      previstoscol: data.previstoscol,
    };
    btn.disabled = true;
    btn.textContent = isEdit ? "GUARDANDO..." : "PLANIFICANDO...";
    try {
      const res = isEdit
        ? await api.put(`/api/previstos/${opts.id}`, payload)
        : await api.post("/api/previstos", payload);
      const id = res?.id_previstos || opts.id;
      navigate(`/previstos/${id}`);
    } catch (err) {
      const detail = (err.body && err.body.error) || err.message || "Error desconocido";
      msg.innerHTML = `<div class="error-banner">${detail}</div>`;
      btn.disabled = false;
      btn.textContent = isEdit ? "GUARDAR CAMBIOS" : "PLANIFICAR MISION";
    }
  });
};
