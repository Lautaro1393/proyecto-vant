import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { formatDateInput } from "../ui-helpers.js";

const TIPOS = [
  { value: "Preventivo",              label: "PREVENTIVO" },
  { value: "Correctivo",              label: "CORRECTIVO" },
  { value: "Actualizacion de Firmware", label: "ACTUALIZACION DE FIRMWARE" },
  { value: "Calibracion",             label: "CALIBRACION" },
];

const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

const validate = (f) => {
  const e = [];
  if (!f.dron_id) e.push("Dron requerido");
  if (!f.fecha) e.push("Fecha requerida");
  if (!f.tipo) e.push("Tipo requerido");
  if (!f.costo && f.costo !== 0) e.push("Costo requerido");
  if (f.costo !== undefined && (isNaN(Number(f.costo)) || Number(f.costo) < 0)) e.push("Costo invalido");
  if (!f.horas_de_vuelo && f.horas_de_vuelo !== 0) e.push("Horas de vuelo requeridas");
  if (f.horas_de_vuelo !== undefined && (isNaN(Number(f.horas_de_vuelo)) || Number(f.horas_de_vuelo) < 0)) e.push("Horas invalidas");
  return e;
};

export const renderMantenimientosForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/mantenimientos");
    return;
  }

  const isEdit = !!opts.id;

  root.innerHTML = renderShell({
    titlePrefix: "24",
    title: isEdit ? "EDITAR MANTENIMIENTO" : "REGISTRAR MANTENIMIENTO",
    id: "MOD-24",
    user,
  });
  const main = bindShell(root, user);
  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="${isEdit ? `#/mantenimientos/${opts.id}` : "#/mantenimientos"}" style="align-self:flex-start">← CANCELAR</a>
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">24</span> ${isEdit ? "EDITAR MANTENIMIENTO" : "REGISTRAR MANTENIMIENTO"}
        <span class="section-head__id">MOD-24</span>
      </div>
    </header>
    <div id="msg"></div>
    <form id="mant-form" class="stack" autocomplete="off" novalidate>
      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="dron_id">Dron *</label>
          <div class="input-wrap">
            <select class="select" id="dron_id" name="dron_id" required>
              <option value="">-- SELECCIONAR --</option>
            </select>
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="fk_bateria_id">Bateria</label>
          <div class="input-wrap">
            <select class="select" id="fk_bateria_id" name="fk_bateria_id">
              <option value="">-- SIN ASIGNAR --</option>
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
          <label class="field__label" for="fecha">Fecha *</label>
          <div class="input-wrap">
            <input class="input" id="fecha" name="fecha" type="date" required />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="tipo">Tipo *</label>
          <div class="input-wrap">
            <select class="select" id="tipo" name="tipo" required>
              <option value="">-- SELECCIONAR --</option>
              ${TIPOS.map((t) => `<option value="${t.value}">${t.label}</option>`).join("")}
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
          <label class="field__label" for="costo">Costo (ARS) *</label>
          <div class="input-wrap">
            <input class="input" id="costo" name="costo" type="number" min="0" step="0.01" required placeholder="0" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="horas_de_vuelo">Horas de vuelo del dron *</label>
          <div class="input-wrap">
            <input class="input" id="horas_de_vuelo" name="horas_de_vuelo" type="number" min="0" step="1" required placeholder="0" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field__label" for="descripcion">Descripcion</label>
        <textarea class="textarea" id="descripcion" name="descripcion" rows="3" maxlength="200" placeholder="Detalle del trabajo realizado..."></textarea>
      </div>

      <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
        <a class="btn btn--secondary btn--block" href="${isEdit ? `#/mantenimientos/${opts.id}` : "#/mantenimientos"}">CANCELAR</a>
        <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">${isEdit ? "GUARDAR CAMBIOS" : "REGISTRAR MANTENIMIENTO"}</button>
      </div>
    </form>
  `;

  const [drones, baterias, existente] = await Promise.all([
    safe(() => api.get("/api/drones"), []),
    safe(() => api.get("/api/baterias"), []),
    isEdit ? safe(() => api.get(`/api/mantenimientos/${opts.id}`)) : Promise.resolve(null),
  ]);

  if (isEdit && !existente) {
    main.innerHTML = `<a class="btn btn--ghost btn--sm" href="#/mantenimientos" style="align-self:flex-start">← VOLVER</a><div class="card mt-3"><div class="card__body error-banner">MANTENIMIENTO NO ENCONTRADO</div></div>`;
    return;
  }

  const selDron = main.querySelector("#dron_id");
  const selBat = main.querySelector("#fk_bateria_id");
  drones.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id_dron;
    opt.textContent = `${d.matricula || "—"} · ${d.nombre_modelo || ""}`.trim();
    selDron.appendChild(opt);
  });
  baterias.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id_bateria;
    opt.textContent = `${b.numero_de_serie || "—"} · ${b.ciclos_de_carga || 0} ciclos`;
    selBat.appendChild(opt);
  });

  if (isEdit && existente) {
    selDron.value = existente.dron_id || "";
    selBat.value = existente.fk_bateria_id || "";
    main.querySelector("#fecha").value = formatDateInput(existente.fecha);
    main.querySelector("#tipo").value = existente.tipo || "";
    main.querySelector("#costo").value = existente.costo || 0;
    main.querySelector("#horas_de_vuelo").value = existente.horas_de_vuelo || 0;
    main.querySelector("#descripcion").value = existente.descripcion || "";
  } else {
    main.querySelector("#fecha").value = new Date().toISOString().slice(0, 10);
  }

  const form = main.querySelector("#mant-form");
  const msg = main.querySelector("#msg");
  const btn = main.querySelector("#btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    const data = Object.fromEntries(new FormData(form));
    data.costo = Number(data.costo);
    data.horas_de_vuelo = Number(data.horas_de_vuelo);
    const errs = validate(data);
    if (errs.length) {
      msg.innerHTML = `<div class="error-banner">${errs.join(" · ")}</div>`;
      return;
    }
    btn.disabled = true;
    btn.textContent = isEdit ? "GUARDANDO..." : "REGISTRANDO...";
    try {
      const res = isEdit
        ? await api.put(`/api/mantenimientos/${opts.id}`, data)
        : await api.post("/api/mantenimientos", data);
      const id = res?.data?.id_mantenimiento || opts.id;
      navigate(`/mantenimientos/${id}`);
    } catch (err) {
      const detail = (err.body && err.body.error) || err.message || "Error desconocido";
      msg.innerHTML = `<div class="error-banner">${detail}</div>`;
      btn.disabled = false;
      btn.textContent = isEdit ? "GUARDAR CAMBIOS" : "REGISTRAR MANTENIMIENTO";
    }
  });
};
