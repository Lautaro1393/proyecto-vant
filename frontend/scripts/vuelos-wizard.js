import { CLIMAS_OPTIONS, TIEMPO_REGEX, COORDS_REGEX } from "./ui-helpers.js";

const STEPS = [
  { key: "drones",   label: "DRONES" },
  { key: "baterias", label: "BATERIAS" },
  { key: "datos",    label: "PILOTO + DATOS" },
  { key: "resumen",  label: "REVISAR" },
];

const CICLOS_MAX = 3000;

const defaultDraft = () => ({
  drones: [],
  baterias: [],
  pilotos: [],
  fecha: new Date().toISOString().slice(0, 10),
  tiempo_de_vuelo: "00:25:00",
  coordenadas: "",
  proposito: "",
  clima: "Despejado",
  observaciones: "",
  estado: "Realizado",
  previsto_id: null,
});

const sanitize = (data) => ({
  drones: (data.drones || []).map(Number).filter(Boolean),
  baterias: (data.baterias || []).map(Number).filter(Boolean),
  pilotos: (data.pilotos || []).map(Number).filter(Boolean),
  fecha: data.fecha || "",
  tiempo_de_vuelo: data.tiempo_de_vuelo || "",
  coordenadas: data.coordenadas || "",
  proposito: (data.proposito || "").trim(),
  clima: data.clima || "Despejado",
  observaciones: (data.observaciones || "").trim(),
  estado: data.estado || "Realizado",
  previsto_id: data.previsto_id ? Number(data.previsto_id) : null,
});

const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

const renderStepper = (current) => `
  <div class="stepper" role="navigation" aria-label="Progreso del wizard">
    ${STEPS.map((s, i) => {
      const cls = i === current ? "stepper__step--active" : (i < current ? "stepper__step--done" : "");
      const barCls = i < current ? "stepper__bar--filled" : "";
      return `
        ${i > 0 ? `<div class="stepper__bar ${barCls}"></div>` : ""}
        <div class="stepper__step ${cls}" data-jump="${i}">
          <div class="stepper__node">${i < current ? "OK" : String(i + 1).padStart(2, "0")}</div>
          <div class="stepper__label">${s.label}</div>
        </div>
      `;
    }).join("")}
  </div>
`;

const renderErrorBanner = (errs) => {
  if (!errs || !errs.length) return "";
  return `<div class="error-banner" role="alert">${errs.map(escape).join(" · ")}</div>`;
};

const renderFooter = (current, busy, isEdit) => {
  const isLast = current === STEPS.length - 1;
  const isFirst = current === 0;
  const submitLabel = busy ? "ENVIANDO..." : (isEdit ? "GUARDAR CAMBIOS" : "REGISTRAR VUELO");
  const dis = busy ? "disabled" : "";
  return `
    <div class="row" style="gap:var(--space-2);margin-top:var(--space-4)">
      <button class="btn btn--secondary btn--block" data-act="cancel" ${dis}>CANCELAR</button>
      ${!isFirst ? `<button class="btn btn--secondary btn--block" data-act="prev" ${dis}>← ANTERIOR</button>` : ""}
      ${isLast
        ? `<button class="btn btn--primary btn--block btn--chamfer" data-act="submit" ${dis}>${submitLabel}</button>`
        : `<button class="btn btn--primary btn--block" data-act="next" ${dis}>SIGUIENTE →</button>`}
    </div>
  `;
};

const renderPickerItem = ({ id, primary, secondary, meta, selected, disabled, reason }) => {
  const cls = ["picker__item"];
  if (selected) cls.push("picker__item--selected");
  if (disabled) cls.push("picker__item--disabled");
  return `
    <button type="button" class="${cls.join(" ")}" data-id="${id}" ${disabled ? "disabled" : ""} title="${reason || ""}">
      <span class="picker__check"></span>
      <span class="picker__body">
        <span class="picker__primary">${primary}</span>
        ${secondary ? `<span class="picker__secondary">${secondary}</span>` : ""}
      </span>
      ${meta ? `<span class="picker__meta">${meta}</span>` : ""}
    </button>
  `;
};

const renderStepDrones = ({ draft, catalogs }) => {
  const all = catalogs.drones || [];
  const items = all
    .filter((d) => {
      const enServicio = (d.estado || "").toLowerCase().includes("servicio") && !(d.estado || "").toLowerCase().includes("fuera");
      const yaSel = draft.drones.includes(Number(d.id_dron));
      return enServicio || yaSel;
    })
    .map((d) => {
      const sel = draft.drones.includes(Number(d.id_dron));
      const enServicio = (d.estado || "").toLowerCase().includes("servicio") && !(d.estado || "").toLowerCase().includes("fuera");
      return renderPickerItem({
        id: d.id_dron,
        primary: d.matricula || `Dron #${d.id_dron}`,
        secondary: `${d.nombre_modelo || "—"} · SN ${d.numero_de_serie || "—"} · ${d.horas_vuelo_acum != null ? d.horas_vuelo_acum + "h" : "?"} acum`,
        meta: enServicio ? "EN SERVICIO" : (d.estado || "—"),
        selected: sel,
        disabled: !enServicio && !sel,
        reason: !enServicio ? "Solo drones en servicio (ya seleccionado para edicion)" : "",
      });
    });
  return `
    <article class="card">
      <header class="card__header">
        <span><span class="card__header-prefix">16</span> SELECCIONAR DRONES</span>
        <span class="card__header-id">MOD-16·01</span>
      </header>
      <div class="card__body">
        <div class="row between mb-2">
          <p class="dim text-sm">Multi-select · solo drones "En Servicio" disponibles</p>
          <span class="picker__count" id="wiz-drones-count">${draft.drones.length} seleccionados</span>
        </div>
        ${items.length
          ? `<div class="picker">${items.join("")}</div>`
          : `<div class="picker__empty">SIN DRONES DISPONIBLES (ninguno en servicio)</div>`}
      </div>
    </article>
  `;
};

const renderStepBaterias = ({ draft, catalogs }) => {
  const all = catalogs.baterias || [];
  const items = all
    .filter((b) => {
      const ciclos = Number(b.ciclos_de_carga || 0);
      const ok = ciclos < CICLOS_MAX;
      const yaSel = draft.baterias.includes(Number(b.id_bateria));
      return ok || yaSel;
    })
    .map((b) => {
      const sel = draft.baterias.includes(Number(b.id_bateria));
      const ciclos = Number(b.ciclos_de_carga || 0);
      const ok = ciclos < CICLOS_MAX;
      return renderPickerItem({
        id: b.id_bateria,
        primary: b.numero_de_serie || `Bat #${b.id_bateria}`,
        secondary: `${b.capacidad || "?"} mAh · ${b.voltage || "?"}V · ${ciclos} ciclos`,
        meta: b.estado || "—",
        selected: sel,
        disabled: !ok && !sel,
        reason: !ok ? `Bateria con ${ciclos} ciclos (>= ${CICLOS_MAX})` : "",
      });
    });
  return `
    <article class="card">
      <header class="card__header">
        <span><span class="card__header-prefix">16</span> SELECCIONAR BATERIAS</span>
        <span class="card__header-id">MOD-16·02</span>
      </header>
      <div class="card__body">
        <div class="row between mb-2">
          <p class="dim text-sm">Multi-select · baterias con menos de ${CICLOS_MAX} ciclos</p>
          <span class="picker__count" id="wiz-baterias-count">${draft.baterias.length} seleccionadas</span>
        </div>
        ${items.length
          ? `<div class="picker">${items.join("")}</div>`
          : `<div class="picker__empty">SIN BATERIAS DISPONIBLES (todas >= ${CICLOS_MAX} ciclos)</div>`}
      </div>
    </article>
  `;
};

const renderStepDatos = ({ draft, catalogs }) => {
  const pilotos = catalogs.pilotos || [];
  const previstos = catalogs.previstos || [];
  return `
    <article class="card">
      <header class="card__header">
        <span><span class="card__header-prefix">16</span> PILOTO + DATOS DEL VUELO</span>
        <span class="card__header-id">MOD-16·03</span>
      </header>
      <div class="card__body">
        <form id="wiz-datos-form" autocomplete="off" novalidate>
          <div class="field">
            <label class="field__label" for="wiz-piloto">Piloto *</label>
            <div class="input-wrap">
              <select class="select" id="wiz-piloto" data-draft-key="pilotos" data-draft-mode="single">
                <option value="">-- SELECCIONAR --</option>
                ${pilotos.map((p) => {
                  const sel = draft.pilotos.length === 1 && draft.pilotos[0] === Number(p.id_pilotos);
                  return `<option value="${p.id_pilotos}" ${sel ? "selected" : ""}>${escape((p.nombre || "") + " " + (p.apellido || ""))} · DNI ${p.dni || "—"}</option>`;
                }).join("")}
              </select>
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field__label" for="wiz-fecha">Fecha *</label>
              <div class="input-wrap">
                <input class="input" id="wiz-fecha" data-draft-key="fecha" type="date" value="${escape(draft.fecha)}" required />
                <div class="input-wrap__brackets">
                  <span class="br-tl"></span><span class="br-tr"></span>
                  <span class="br-bl"></span><span class="br-br"></span>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="wiz-tiempo">Tiempo de vuelo (HH:MM:SS) *</label>
              <div class="input-wrap">
                <input class="input" id="wiz-tiempo" data-draft-key="tiempo_de_vuelo" type="text" value="${escape(draft.tiempo_de_vuelo)}" required placeholder="00:25:00" pattern="^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$" />
                <div class="input-wrap__brackets">
                  <span class="br-tl"></span><span class="br-tr"></span>
                  <span class="br-bl"></span><span class="br-br"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="wiz-coords">Coordenadas (lat,lng) *</label>
            <div class="input-wrap">
              <input class="input" id="wiz-coords" data-draft-key="coordenadas" type="text" value="${escape(draft.coordenadas)}" required placeholder="-34.6037,-58.3816" pattern="^-?\\d{1,3}\\.?\\d*,-?\\d{1,3}\\.?\\d*$" />
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="wiz-proposito">Proposito *</label>
            <div class="input-wrap">
              <input class="input" id="wiz-proposito" data-draft-key="proposito" type="text" value="${escape(draft.proposito)}" required placeholder="Inspeccion / Vigilancia / etc." maxlength="120" />
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field__label" for="wiz-clima">Clima *</label>
              <div class="input-wrap">
                <select class="select" id="wiz-clima" data-draft-key="clima">
                  ${CLIMAS_OPTIONS.map((c) => `<option value="${c.value}" ${draft.clima === c.value ? "selected" : ""}>${c.label}</option>`).join("")}
                </select>
                <div class="input-wrap__brackets">
                  <span class="br-tl"></span><span class="br-tr"></span>
                  <span class="br-bl"></span><span class="br-br"></span>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="wiz-estado">Estado</label>
              <div class="input-wrap">
                <input class="input" id="wiz-estado" data-draft-key="estado" type="text" value="${escape(draft.estado)}" placeholder="Realizado" />
                <div class="input-wrap__brackets">
                  <span class="br-tl"></span><span class="br-tr"></span>
                  <span class="br-bl"></span><span class="br-br"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="wiz-previsto">Vinculado a previsto (opcional)</label>
            <div class="input-wrap">
              <select class="select" id="wiz-previsto" data-draft-key="previsto_id">
                <option value="">-- SIN VINCULAR --</option>
                ${previstos.map((p) => {
                  const sel = draft.previsto_id === Number(p.id_previstos);
                  return `<option value="${p.id_previstos}" ${sel ? "selected" : ""}>${escape(p.nombre_clave || ("Previsto #" + p.id_previstos))}</option>`;
                }).join("")}
              </select>
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="wiz-obs">Observaciones</label>
            <textarea class="textarea" id="wiz-obs" data-draft-key="observaciones" rows="3" placeholder="Notas adicionales...">${escape(draft.observaciones)}</textarea>
          </div>
        </form>
      </div>
    </article>
  `;
};

const renderStepResumen = ({ draft, catalogs }) => {
  const dronById = new Map((catalogs.drones || []).map((d) => [Number(d.id_dron), d]));
  const batById = new Map((catalogs.baterias || []).map((b) => [Number(b.id_bateria), b]));
  const pilotoById = new Map((catalogs.pilotos || []).map((p) => [Number(p.id_pilotos), p]));
  const prevById = new Map((catalogs.previstos || []).map((p) => [Number(p.id_previstos), p]));

  const dronList = draft.drones.map((id) => dronById.get(id) || { matricula: `#${id}`, horas_vuelo_acum: null });
  const batList  = draft.baterias.map((id) => batById.get(id) || { numero_de_serie: `#${id}`, ciclos_de_carga: null });
  const pilList  = draft.pilotos.map((id) => {
    const p = pilotoById.get(id);
    return p ? { nombre: ((p.nombre || "") + " " + (p.apellido || "")).trim() || `#${id}` } : { nombre: `#${id}` };
  });
  const previsto = draft.previsto_id ? prevById.get(draft.previsto_id) : null;

  const sectionStyle = "padding:var(--space-1) 0;border-bottom:1px solid var(--outline-variant);display:flex;justify-content:space-between;align-items:center;gap:var(--space-2)";
  const editBtn = (step) => `<button type="button" class="btn btn--ghost btn--sm" data-jump="${step}" style="min-height:24px;padding:0 var(--space-2);font-size:10px">EDITAR</button>`;

  return `
    <article class="card">
      <header class="card__header">
        <span><span class="card__header-prefix">16</span> RESUMEN DEL VUELO</span>
        <span class="card__header-id">MOD-16·04</span>
      </header>
      <div class="card__body">
        <p class="dim text-sm mb-2">Revisa los datos antes de enviar. Usa EDITAR para volver a un paso.</p>

        <div class="row between mb-2">
          <h3 class="label-caps">DRONES (${dronList.length})</h3>
          ${editBtn(0)}
        </div>
        ${dronList.length
          ? `<ul style="list-style:none;padding:0;margin:0 0 var(--space-3)">
              ${dronList.map((d) => `<li style="${sectionStyle}">
                <span>${escape(d.matricula || "—")}</span>
                <span class="dim text-sm">${d.horas_vuelo_acum != null ? d.horas_vuelo_acum + "h acum" : ""}</span>
              </li>`).join("")}
            </ul>`
          : `<p class="dim">— sin drones —</p>`}

        <div class="row between mb-2">
          <h3 class="label-caps">BATERIAS (${batList.length})</h3>
          ${editBtn(1)}
        </div>
        ${batList.length
          ? `<ul style="list-style:none;padding:0;margin:0 0 var(--space-3)">
              ${batList.map((b) => `<li style="${sectionStyle}">
                <span>${escape(b.numero_de_serie || "—")}</span>
                <span class="dim text-sm">${b.ciclos_de_carga != null ? b.ciclos_de_carga + " ciclos" : ""}</span>
              </li>`).join("")}
            </ul>`
          : `<p class="dim">— sin baterias —</p>`}

        <div class="row between mb-2">
          <h3 class="label-caps">PILOTOS (${pilList.length})</h3>
          ${editBtn(2)}
        </div>
        ${pilList.length
          ? `<ul style="list-style:none;padding:0;margin:0 0 var(--space-3)">
              ${pilList.map((p) => `<li style="${sectionStyle}"><span>${escape(p.nombre)}</span></li>`).join("")}
            </ul>`
          : `<p class="dim">— sin pilotos —</p>`}

        <div class="row between mb-2">
          <h3 class="label-caps">DATOS</h3>
          ${editBtn(2)}
        </div>
        <div class="grid-2">
          <div><span class="dim text-sm">Fecha</span><div>${escape(draft.fecha) || "—"}</div></div>
          <div><span class="dim text-sm">Tiempo</span><div>${escape(draft.tiempo_de_vuelo) || "—"}</div></div>
          <div><span class="dim text-sm">Coords</span><div>${escape(draft.coordenadas) || "—"}</div></div>
          <div><span class="dim text-sm">Clima</span><div>${escape(draft.clima) || "—"}</div></div>
          <div style="grid-column:1/-1"><span class="dim text-sm">Proposito</span><div>${escape(draft.proposito) || "—"}</div></div>
          ${draft.observaciones ? `<div style="grid-column:1/-1"><span class="dim text-sm">Observaciones</span><div>${escape(draft.observaciones)}</div></div>` : ""}
          <div><span class="dim text-sm">Estado</span><div>${escape(draft.estado)}</div></div>
          <div><span class="dim text-sm">Previsto</span><div>${previsto ? escape(previsto.nombre_clave) : "— sin vincular —"}</div></div>
        </div>
      </div>
    </article>
  `;
};

const STEP_RENDERERS = {
  drones:   renderStepDrones,
  baterias: renderStepBaterias,
  datos:    renderStepDatos,
  resumen:  renderStepResumen,
};

const bindStepPicker = ({ root, key, wiz }) => {
  const countEl = root.querySelector(`#wiz-${key}-count`);
  const items = root.querySelectorAll(`.picker__item[data-id]`);
  items.forEach((item) => {
    if (item.classList.contains("picker__item--disabled")) return;
    const id = Number(item.dataset.id);
    item.addEventListener("click", () => {
      const current = wiz.getDraft()[key].slice();
      const i = current.indexOf(id);
      if (i >= 0) current.splice(i, 1);
      else current.push(id);
      wiz.setDraft({ [key]: current });
      item.classList.toggle("picker__item--selected");
      if (countEl) countEl.textContent = `${current.length} seleccionados`;
    });
  });
};

const bindStepDatos = ({ root, wiz }) => {
  const form = root.querySelector("#wiz-datos-form");
  if (!form) return;
  form.querySelectorAll("[data-draft-key]").forEach((el) => {
    const key = el.dataset.draftKey;
    const mode = el.dataset.draftMode;
    const handler = () => {
      let val;
      if (mode === "single") {
        val = el.value ? [Number(el.value)] : [];
      } else if (key === "previsto_id") {
        val = el.value ? Number(el.value) : null;
      } else {
        val = el.value;
      }
      wiz.setDraft({ [key]: val });
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
};

const bindStepResumen = ({ wiz }) => {
  // No-op: resumen es read-only. Los botones EDITAR ya se manejan via data-jump
  // en el footer del stepper, pero también los renderizamos en cada seccion.
  // (Si quisieras listeners custom para "editar seccion X", iria aqui.)
};

const STEP_BINDERS = {
  drones:   ({ root, wiz }) => bindStepPicker({ root, key: "drones", wiz }),
  baterias: ({ root, wiz }) => bindStepPicker({ root, key: "baterias", wiz }),
  datos:    ({ root, wiz }) => bindStepDatos({ root, wiz }),
  resumen:  () => {},
};

const validateStep = (n, draft) => {
  const e = [];
  if (n === 0) {
    if (!draft.drones.length) e.push("Selecciona al menos un dron");
  } else if (n === 1) {
    if (!draft.baterias.length) e.push("Selecciona al menos una bateria");
  } else if (n === 2) {
    if (!draft.pilotos.length) e.push("Selecciona un piloto");
    if (!draft.fecha) e.push("Fecha requerida");
    if (!draft.tiempo_de_vuelo) e.push("Tiempo de vuelo requerido");
    else if (!TIEMPO_REGEX.test(draft.tiempo_de_vuelo)) e.push("Tiempo invalido (formato HH:MM:SS)");
    if (!draft.coordenadas) e.push("Coordenadas requeridas");
    else if (!COORDS_REGEX.test(draft.coordenadas)) e.push("Coordenadas invalidas (formato lat,lng)");
    if (!draft.proposito) e.push("Proposito requerido");
    if (!CLIMAS_OPTIONS.some((c) => c.value === draft.clima)) e.push("Clima invalido");
  }
  return e;
};

export const createWizard = ({ root, isEdit = false, initialData = {}, catalogs = {}, onSubmit, onCancel }) => {
  if (!root) throw new Error("createWizard: `root` es requerido");

  let step = 0;
  let draft = sanitize({ ...defaultDraft(), ...initialData });
  let errs = [];
  let busy = false;

  const safeCatalogs = {
    drones: Array.isArray(catalogs.drones) ? catalogs.drones : [],
    baterias: Array.isArray(catalogs.baterias) ? catalogs.baterias : [],
    pilotos: Array.isArray(catalogs.pilotos) ? catalogs.pilotos : [],
    previstos: Array.isArray(catalogs.previstos) ? catalogs.previstos : [],
  };

  const buildPayload = () => ({
    fecha: draft.fecha,
    coordenadas: draft.coordenadas,
    tiempo_de_vuelo: draft.tiempo_de_vuelo,
    proposito: draft.proposito,
    clima: draft.clima,
    observaciones: draft.observaciones || null,
    drones: draft.drones,
    baterias: draft.baterias,
    pilotos: draft.pilotos,
    estado: draft.estado,
    previsto_id: draft.previsto_id,
  });

  const render = () => {
    const stepDef = STEPS[step];
    const bodyHtml = STEP_RENDERERS[stepDef.key]({ draft, catalogs: safeCatalogs });
    root.innerHTML = `
      <header class="section-head">
        <div class="section-head__title">
          <span class="section-head__title-prefix">16</span> ${isEdit ? "EDITAR VUELO" : "NUEVO VUELO"}
          <span class="section-head__id">MOD-16</span>
        </div>
      </header>
      ${renderStepper(step)}
      <div id="wiz-errors">${renderErrorBanner(errs)}</div>
      <div id="wiz-body">${bodyHtml}</div>
      <div id="wiz-footer">${renderFooter(step, busy, isEdit)}</div>
    `;
    bindFooter();
    bindStepBody();
  };

  const bindStepBody = () => {
    const stepDef = STEPS[step];
    const binder = STEP_BINDERS[stepDef.key];
    if (binder) binder({ root, ctx: { draft, catalogs: safeCatalogs, stepIndex: step, stepKey: stepDef.key }, wiz: api });
  };

  const bindFooter = () => {
    root.querySelector('[data-act="cancel"]')?.addEventListener("click", () => {
      if (busy) return;
      if (typeof onCancel === "function") onCancel();
    });
    root.querySelector('[data-act="prev"]')?.addEventListener("click", () => {
      if (busy) return;
      if (step > 0) { step--; errs = []; render(); }
    });
    root.querySelector('[data-act="next"]')?.addEventListener("click", () => {
      if (busy) return;
      errs = validateStep(step, draft);
      if (errs.length) { render(); return; }
      if (step < STEPS.length - 1) { step++; render(); }
    });
    root.querySelector('[data-act="submit"]')?.addEventListener("click", async () => {
      if (busy) return;
      for (let i = 0; i < STEPS.length - 1; i++) {
        errs = validateStep(i, draft);
        if (errs.length) { step = i; render(); return; }
      }
      busy = true;
      render();
      try {
        if (typeof onSubmit === "function") await onSubmit(buildPayload());
      } catch (e) {
        errs = [e?.message || "Error al enviar"];
        busy = false;
        render();
      }
    });
  };

  const api = {
    getDraft: () => ({ ...draft, drones: [...draft.drones], baterias: [...draft.baterias], pilotos: [...draft.pilotos] }),
    getStep: () => step,
    getStepCount: () => STEPS.length,
    setDraft: (patch) => { draft = sanitize({ ...draft, ...patch }); },
    goTo: (n) => {
      if (busy) return;
      if (n >= 0 && n < STEPS.length) { step = n; errs = []; render(); }
    },
    reRender: () => render(),
    buildPayload,
    destroy: () => { root.innerHTML = ""; },
  };

  render();

  return api;
};
