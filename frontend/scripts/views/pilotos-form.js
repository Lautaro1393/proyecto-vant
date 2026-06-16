import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { ROL_OPTIONS, formatDateInput } from "../ui-helpers.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dniRegex = /^\d{6,10}$/;

const validate = (f, isEdit) => {
  const errs = [];
  if (!f.nombre?.trim())  errs.push("Nombre requerido");
  if (!f.apellido?.trim()) errs.push("Apellido requerido");
  if (!f.dni?.trim())     errs.push("DNI requerido");
  else if (!dniRegex.test(f.dni.trim())) errs.push("DNI debe ser numerico (6-10 digitos)");
  if (!f.email?.trim())   errs.push("Email requerido");
  else if (!emailRegex.test(f.email.trim())) errs.push("Email invalido");
  if (!f.rol)             errs.push("Rol requerido");
  if (!isEdit && !f.password) errs.push("Password requerido (en alta)");
  if (!isEdit && f.password && f.password.length < 6) errs.push("Password minimo 6 caracteres");
  return errs;
};

export const renderPilotosForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/pilotos");
    return;
  }

  const isEdit = !!opts.id;
  const title = isEdit ? `EDITAR PILOTO #${opts.id}` : "ALTA DE PILOTO";

  root.innerHTML = renderShell({
    titlePrefix: "13",
    title: isEdit ? "EDITAR PILOTO" : "ALTA PILOTO",
    id: "MOD-13",
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="${isEdit ? `#/pilotos/${opts.id}` : "#/pilotos"}" style="align-self:flex-start">← CANCELAR</a>
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">13</span> ${title}
        <span class="section-head__id">MOD-13</span>
      </div>
    </header>
    <div id="msg"></div>
    <form id="piloto-form" class="stack" autocomplete="off" novalidate>
      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="nombre">Nombre *</label>
          <div class="input-wrap">
            <input class="input" id="nombre" name="nombre" required placeholder="Juan" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="apellido">Apellido *</label>
          <div class="input-wrap">
            <input class="input" id="apellido" name="apellido" required placeholder="Perez" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="dni">DNI *</label>
          <div class="input-wrap">
            <input class="input" id="dni" name="dni" required inputmode="numeric" placeholder="12345678" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="certificacion">Certificacion</label>
          <div class="input-wrap">
            <input class="input" id="certificacion" name="certificacion" placeholder="Ej: RPA-A1" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="email">Email *</label>
          <div class="input-wrap">
            <input class="input" id="email" name="email" type="email" required placeholder="jperez@vant.com" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="contacto">Contacto (numerico, sin prefijos)</label>
          <div class="input-wrap">
            <input class="input" id="contacto" name="contacto" inputmode="numeric" placeholder="1145678901" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="vencimiento_cma">Vencimiento CMA</label>
          <div class="input-wrap">
            <input class="input" id="vencimiento_cma" name="vencimiento_cma" type="date" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="rol">Rol *</label>
          <div class="input-wrap">
            <select class="select" id="rol" name="rol" required>
              ${ROL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join("")}
            </select>
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field__label" for="password">
          Password ${isEdit ? "(dejar vacio para mantener la actual)" : "*"}
        </label>
        <div class="input-wrap">
          <input class="input" id="password" name="password" type="password" ${isEdit ? "" : "required"} minlength="6" autocomplete="new-password" placeholder="${isEdit ? "Sin cambios" : "Minimo 6 caracteres"}" />
          <div class="input-wrap__brackets">
            <span class="br-tl"></span><span class="br-tr"></span>
            <span class="br-bl"></span><span class="br-br"></span>
          </div>
        </div>
      </div>

      <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
        <a class="btn btn--secondary btn--block" href="${isEdit ? `#/pilotos/${opts.id}` : "#/pilotos"}">CANCELAR</a>
        <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">${isEdit ? "GUARDAR CAMBIOS" : "REGISTRAR PILOTO"}</button>
      </div>
    </form>
  `;

  const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };
  const pilotoExistente = isEdit
    ? await safe(() => api.get(`/api/pilotos/${opts.id}`))
    : null;

  if (isEdit && pilotoExistente) {
    main.querySelector("#nombre").value             = pilotoExistente.nombre || "";
    main.querySelector("#apellido").value          = pilotoExistente.apellido || "";
    main.querySelector("#dni").value               = pilotoExistente.dni || "";
    main.querySelector("#certificacion").value     = pilotoExistente.certificacion || "";
    main.querySelector("#email").value             = pilotoExistente.email || "";
    main.querySelector("#contacto").value          = pilotoExistente.contacto || "";
    main.querySelector("#vencimiento_cma").value   = formatDateInput(pilotoExistente.vencimiento_cma);
    main.querySelector("#rol").value               = pilotoExistente.rol || "";
  }

  const form = main.querySelector("#piloto-form");
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
    btn.disabled = true;
    btn.textContent = isEdit ? "GUARDANDO..." : "REGISTRANDO...";
    try {
      const url    = isEdit ? `/api/pilotos/${opts.id}` : `/api/pilotos`;
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...data };
      if (isEdit && !payload.password) delete payload.password;
      delete payload.password_confirm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("vant.jwt")}` },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get("content-type") || "";
      const body = ct.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) {
        const err = new Error((body && body.error) || `HTTP ${res.status}`);
        err.status = res.status;
        err.body = body;
        throw err;
      }
      const targetId = isEdit ? opts.id : (body?.id_pilotos || body?.piloto?.id_pilotos);
      navigate(isEdit ? `/pilotos/${targetId}` : (targetId ? `/pilotos/${targetId}` : "/pilotos"));
    } catch (err) {
      const detail = (err.body && err.body.error) || err.message || "Error desconocido";
      const extra  = err.status ? ` (HTTP ${err.status})` : "";
      msg.innerHTML = `<div class="error-banner">${detail}${extra}</div>`;
      btn.disabled = false;
      btn.textContent = isEdit ? "GUARDAR CAMBIOS" : "REGISTRAR PILOTO";
    }
  });
};
