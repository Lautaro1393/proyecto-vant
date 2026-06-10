import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const formatDateInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
};

const validate = (f) => {
  const errs = [];
  if (!f.matricula?.trim()) errs.push("Matricula requerida");
  if (!f.numero_de_serie?.trim()) errs.push("Numero de serie requerido");
  if (!f.id_modelo_dron) errs.push("Modelo requerido");
  return errs;
};

export const renderDronesForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/drones");
    return;
  }

  const isEdit = !!opts.id;
  const title = isEdit ? `EDITAR DRON #${opts.id}` : "ALTA DE DRON";

  root.innerHTML = renderShell({
    titlePrefix: isEdit ? "06" : "06",
    title: isEdit ? "EDITAR DRON" : "ALTA DRON",
    id: "MOD-06",
    user,
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="${isEdit ? `#/drones/${opts.id}` : "#/drones"}" style="align-self:flex-start">← CANCELAR</a>
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">06</span> ${title}
        <span class="section-head__id">MOD-06</span>
      </div>
    </header>
    <div id="msg"></div>
    <form id="dron-form" class="stack" autocomplete="off" novalidate>
      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="matricula">Matricula *</label>
          <div class="input-wrap">
            <input class="input" id="matricula" name="matricula" required placeholder="VNT-XXXX" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="numero_serie">N° Serie *</label>
          <div class="input-wrap">
            <input class="input" id="numero_serie" name="numero_de_serie" required />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="field__label" for="id_modelo_dron">Modelo *</label>
          <div class="input-wrap">
            <select class="select" id="id_modelo_dron" name="id_modelo_dron" required>
              <option value="">-- SELECCIONAR --</option>
            </select>
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="piloto_id">Piloto</label>
          <div class="input-wrap">
            <select class="select" id="piloto_id" name="piloto_id">
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
          <label class="field__label" for="fecha_adquisicion">Fecha adquisicion</label>
          <div class="input-wrap">
            <input class="input" id="fecha_adquisicion" name="fecha_adquisicion" type="date" />
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="estado">Estado</label>
          <div class="input-wrap">
            <select class="select" id="estado" name="estado">
              <option value="Disponible">Disponible</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="En Vuelo">En Vuelo</option>
            </select>
            <div class="input-wrap__brackets">
              <span class="br-tl"></span><span class="br-tr"></span>
              <span class="br-bl"></span><span class="br-br"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field__label" for="observaciones">Observaciones</label>
        <textarea class="textarea" id="observaciones" name="observaciones" rows="3"></textarea>
      </div>

      ${!isEdit ? `
        <div class="field">
          <label class="field__label">Imagen (opcional, max 5MB)</label>
          <div class="dropzone" id="dropzone" tabindex="0">
            <input type="file" id="imagen" name="imagen" accept="image/jpeg,image/png,image/gif" hidden />
            <div class="dropzone__inner" id="dz-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="label-caps mt-2">ARRASTRAR O TOCAR</p>
              <p class="dim text-sm">JPEG / PNG / GIF</p>
            </div>
            <img class="dropzone__preview" id="dz-preview" alt="preview" />
          </div>
          <p class="field__hint" id="dz-hint"></p>
        </div>
      ` : `
        <p class="dim text-sm">Edicion no soporta cambio de imagen (lim. backend). Mantener imagen actual.</p>
      `}

      <div class="row" style="gap:var(--space-2);margin-top:var(--space-3)">
        <a class="btn btn--secondary btn--block" href="${isEdit ? `#/drones/${opts.id}` : "#/drones"}">CANCELAR</a>
        <button type="submit" class="btn btn--primary btn--block btn--chamfer" id="btn-submit">${isEdit ? "GUARDAR CAMBIOS" : "ALTA DRON"}</button>
      </div>
    </form>
  `;

  const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

  // Cargar modelos + pilotos en paralelo
  const [modelos, pilotos, dronExistente] = await Promise.all([
    safe(() => api.get("/api/modelos"), []),
    safe(() => api.get("/api/pilotos"), []),
    isEdit ? safe(() => api.get(`/api/drones/${opts.id}`)) : Promise.resolve(null),
  ]);

  const selModelo  = main.querySelector("#id_modelo_dron");
  const selPiloto  = main.querySelector("#piloto_id");
  modelos.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id_modelo_dron ?? m.id;
    opt.textContent = `${m.nombre || m.nombre_modelo || "—"} — ${m.fabricante || ""}`;
    selModelo.appendChild(opt);
  });
  pilotos.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id_pilotos ?? p.id;
    opt.textContent = `${p.nombre || ""} ${p.apellido || ""}`.trim() || p.email || `Piloto #${opt.value}`;
    selPiloto.appendChild(opt);
  });

  if (isEdit && dronExistente) {
    main.querySelector("#matricula").value         = dronExistente.matricula || "";
    main.querySelector("#numero_serie").value      = dronExistente.numero_de_serie || "";
    main.querySelector("#id_modelo_dron").value    = dronExistente.id_modelo_dron || "";
    main.querySelector("#piloto_id").value         = dronExistente.piloto_id || "";
    main.querySelector("#fecha_adquisicion").value = formatDateInput(dronExistente.fecha_adquisicion);
    main.querySelector("#estado").value            = dronExistente.estado || "Disponible";
    main.querySelector("#observaciones").value     = dronExistente.observaciones || "";
  }

  // Drag & drop + preview
  if (!isEdit) {
    const dz = main.querySelector("#dropzone");
    const input = main.querySelector("#imagen");
    const inner = main.querySelector("#dz-inner");
    const preview = main.querySelector("#dz-preview");
    const hint = main.querySelector("#dz-hint");

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

  const form = main.querySelector("#dron-form");
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
    btn.textContent = isEdit ? "GUARDANDO..." : "REGISTRANDO...";
    try {
      if (isEdit) {
        await api.put(`/api/drones/${opts.id}`, data);
      } else {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== "" && v != null) fd.append(k, v); });
        const file = main.querySelector("#imagen")?.files[0];
        if (file) fd.append("imagen", file);
        await fetch(`/api/drones`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("vant.jwt")}` },
          body: fd,
        }).then(async (r) => {
          const ct = r.headers.get("content-type") || "";
          const body = ct.includes("application/json") ? await r.json() : await r.text();
          if (!r.ok) {
            const err = new Error((body && body.error) || `HTTP ${r.status}`);
            err.body = body;
            throw err;
          }
          return body;
        });
      }
      navigate(isEdit ? `/drones/${opts.id}` : "/drones");
    } catch (err) {
      msg.innerHTML = `<div class="error-banner">${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = isEdit ? "GUARDAR CAMBIOS" : "ALTA DRON";
    }
  });
};
