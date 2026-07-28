import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { ROL_OPTIONS, formatDateInput } from "../ui-helpers.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dniRegex = /^\d{6,10}$/;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

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

      <div class="field">
        <label class="field__label">Foto (opcional${isEdit ? ", reemplazar la actual" : ""}, max 5MB)</label>
        <div class="dropzone" id="dropzone" tabindex="0">
          <input type="file" id="imagen" name="imagen" accept="image/jpeg,image/png,image/gif" hidden />
          <div class="dropzone__inner" id="dz-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="label-caps mt-2">${isEdit ? "REEMPLAZAR FOTO" : "ARRASTRAR O TOCAR"}</p>
            <p class="dim text-sm">JPEG / PNG / GIF</p>
          </div>
          <img class="dropzone__preview" id="dz-preview" alt="preview" />
        </div>
        <p class="field__hint" id="dz-hint"></p>
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

  // Drag & drop + preview
  {
    const dz = main.querySelector("#dropzone");
    const input = main.querySelector("#imagen");
    const inner = main.querySelector("#dz-inner");
    const preview = main.querySelector("#dz-preview");
    const hint = main.querySelector("#dz-hint");

    if (isEdit && pilotoExistente?.imagen) {
      preview.src = `/uploads/${pilotoExistente.imagen}`;
      preview.style.display = "block";
      inner.style.display = "none";
      hint.innerHTML = `<span class="dim">Actual: ${pilotoExistente.imagen}</span>`;
    }

    const setFile = (file) => {
      hint.innerHTML = "";
      if (!file) { inner.style.display = "grid"; preview.style.display = "none"; return; }
      if (!ALLOWED.includes(file.type)) {
        hint.innerHTML = `<span class="accent-alert">Formato no permitido (${file.type || "?"})</span>`;
        input.value = "";
        return;
      }
      if (file.size > MAX_BYTES) {
        hint.innerHTML = `<span class="accent-alert">Supera 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB)</span>`;
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
        inner.style.display = "none";
        hint.innerHTML = `<span class="accent-safe">${file.name} · ${(file.size / 1024).toFixed(0)}KB</span>`;
      };
      reader.readAsDataURL(file);
    };

    input.addEventListener("change", (e) => setFile(e.target.files[0]));
    dz.addEventListener("click", () => input.click());
    dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, (e) => {
      e.preventDefault(); dz.classList.add("dropzone--active");
    }));
    ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, (e) => {
      e.preventDefault(); dz.classList.remove("dropzone--active");
    }));
    dz.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        setFile(file);
      }
    });
  }

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
      const token  = localStorage.getItem("vant.jwt");

      const fd = new FormData();
      const fileInput = main.querySelector("#imagen");
      const file = fileInput?.files[0];
      Object.entries(data).forEach(([k, v]) => {
        if (k === "imagen") return;
        if (k === "password" && isEdit && !v) return;
        if (v !== "" && v != null) fd.append(k, v);
      });
      if (file && file.size > 0) fd.append("imagen", file);

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
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
