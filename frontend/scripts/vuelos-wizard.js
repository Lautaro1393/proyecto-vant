import { CLIMAS_OPTIONS, TIEMPO_REGEX, COORDS_REGEX } from "./ui-helpers.js";

const STEPS = [
  { key: "drones",   label: "DRONES" },
  { key: "baterias", label: "BATERIAS" },
  { key: "datos",    label: "PILOTO + DATOS" },
  { key: "resumen",  label: "REVISAR" },
];

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

const renderStepper = (current) => `
  <div class="stepper" role="navigation" aria-label="Progreso del wizard">
    ${STEPS.map((s, i) => {
      const cls = i === current ? "stepper__step--active" : (i < current ? "stepper__step--done" : "");
      const barCls = i < current ? "stepper__bar--filled" : "";
      return `
        ${i > 0 ? `<div class="stepper__bar ${barCls}"></div>` : ""}
        <div class="stepper__step ${cls}">
          <div class="stepper__node">${i < current ? "OK" : String(i + 1).padStart(2, "0")}</div>
          <div class="stepper__label">${s.label}</div>
        </div>
      `;
    }).join("")}
  </div>
`;

const renderErrorBanner = (errs) => {
  if (!errs || !errs.length) return "";
  return `<div class="error-banner" role="alert">${errs.join(" · ")}</div>`;
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

const renderStubBody = (current, draft, catalogs) => {
  const stepDef = STEPS[current];
  const ctx = { draft, catalogs, stepIndex: current, stepKey: stepDef.key };
  const renderer = STEP_RENDERERS[stepDef.key];
  if (renderer) return renderer(ctx);
  return `<div class="card"><div class="card__body dim">[renderer missing for step "${stepDef.key}"]</div></div>`;
};

const renderStepDrones = () => `
  <article class="card">
    <header class="card__header">
      <span><span class="card__header-prefix">16</span> SELECCIONAR DRONES</span>
      <span class="card__header-id">MOD-16·01</span>
    </header>
    <div class="card__body">
      <p class="dim">[STUB 4.2B] Listado de drones disponibles (filtro: estado "En Servicio") con multi-select via .picker__item.</p>
      <p class="dim text-sm">Implementar en 4.2C: cards con matricula, modelo, horas_vuelo_acum + checkbox visual.</p>
    </div>
  </article>
`;

const renderStepBaterias = () => `
  <article class="card">
    <header class="card__header">
      <span><span class="card__header-prefix">16</span> SELECCIONAR BATERIAS</span>
      <span class="card__header-id">MOD-16·02</span>
    </header>
    <div class="card__body">
      <p class="dim">[STUB 4.2B] Listado de baterias disponibles (filtro: ciclos_de_carga &lt; 3000) con multi-select.</p>
      <p class="dim text-sm">Implementar en 4.2C: cards con numero_de_serie, capacidad, voltage, ciclos, segbar.</p>
    </div>
  </article>
`;

const renderStepDatos = ({ draft, catalogs }) => `
  <article class="card">
    <header class="card__header">
      <span><span class="card__header-prefix">16</span> PILOTO + DATOS DEL VUELO</span>
      <span class="card__header-id">MOD-16·03</span>
    </header>
    <div class="card__body">
      <p class="dim">[STUB 4.2B] Form con piloto, fecha, tiempo_de_vuelo, coordenadas, proposito, clima, observaciones, estado, previsto_id.</p>
      <p class="dim text-sm">Implementar en 4.2C: select de piloto (catalogs.pilotos), date input, text inputs con regex, textarea, select clima con CLIMAS_OPTIONS, select previsto opcional.</p>
    </div>
  </article>
`;

const renderStepResumen = ({ draft, catalogs }) => {
  const dronById = new Map((catalogs.drones || []).map((d) => [Number(d.id_dron), d]));
  const batById = new Map((catalogs.baterias || []).map((b) => [Number(b.id_bateria), b]));
  const pilotoById = new Map((catalogs.pilotos || []).map((p) => [Number(p.id_pilotos), p]));

  const dronList = draft.drones.map((id) => dronById.get(id) || { matricula: `#${id}` });
  const batList  = draft.baterias.map((id) => batById.get(id) || { numero_de_serie: `#${id}` });
  const pilList  = draft.pilotos.map((id) => {
    const p = pilotoById.get(id);
    return p ? { nombre: `${p.nombre || ""} ${p.apellido || ""}`.trim() || `#${id}` } : { nombre: `#${id}` };
  });

  return `
    <article class="card">
      <header class="card__header">
        <span><span class="card__header-prefix">16</span> RESUMEN</span>
        <span class="card__header-id">MOD-16·04</span>
      </header>
      <div class="card__body">
        <p class="dim text-sm mb-2">Revisa los datos antes de enviar. Usa los botones EDITAR para volver a un paso.</p>

        <h3 class="label-caps">DRONES (${dronList.length})</h3>
        ${dronList.length
          ? `<ul style="list-style:none;padding:0;margin:var(--space-1) 0 var(--space-3)">
              ${dronList.map((d) => `<li class="row between" style="padding:var(--space-1) 0;border-bottom:1px solid var(--outline-variant)">
                <span>${d.matricula || d.nombre || "—"}</span>
                <span class="dim text-sm">${d.horas_vuelo_acum != null ? d.horas_vuelo_acum + "h" : ""}</span>
              </li>`).join("")}
            </ul>`
          : `<p class="dim">— sin drones —</p>`}

        <h3 class="label-caps">BATERIAS (${batList.length})</h3>
        ${batList.length
          ? `<ul style="list-style:none;padding:0;margin:var(--space-1) 0 var(--space-3)">
              ${batList.map((b) => `<li class="row between" style="padding:var(--space-1) 0;border-bottom:1px solid var(--outline-variant)">
                <span>${b.numero_de_serie || "—"}</span>
                <span class="dim text-sm">${b.ciclos_de_carga != null ? b.ciclos_de_carga + " ciclos" : ""}</span>
              </li>`).join("")}
            </ul>`
          : `<p class="dim">— sin baterias —</p>`}

        <h3 class="label-caps">PILOTOS (${pilList.length})</h3>
        ${pilList.length
          ? `<ul style="list-style:none;padding:0;margin:var(--space-1) 0 var(--space-3)">
              ${pilList.map((p) => `<li style="padding:var(--space-1) 0;border-bottom:1px solid var(--outline-variant)">${p.nombre}</li>`).join("")}
            </ul>`
          : `<p class="dim">— sin pilotos —</p>`}

        <h3 class="label-caps">DATOS</h3>
        <div class="grid-2 mt-2">
          <div><span class="dim text-sm">Fecha</span><div>${draft.fecha || "—"}</div></div>
          <div><span class="dim text-sm">Tiempo</span><div>${draft.tiempo_de_vuelo || "—"}</div></div>
          <div><span class="dim text-sm">Coords</span><div>${draft.coordenadas || "—"}</div></div>
          <div><span class="dim text-sm">Clima</span><div>${draft.clima || "—"}</div></div>
          <div style="grid-column:1/-1"><span class="dim text-sm">Proposito</span><div>${draft.proposito || "—"}</div></div>
          ${draft.observaciones ? `<div style="grid-column:1/-1"><span class="dim text-sm">Observaciones</span><div>${draft.observaciones}</div></div>` : ""}
          <div><span class="dim text-sm">Estado</span><div>${draft.estado}</div></div>
          <div><span class="dim text-sm">Previsto</span><div>${draft.previsto_id || "— sin vincular —"}</div></div>
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
    root.innerHTML = `
      <header class="section-head">
        <div class="section-head__title">
          <span class="section-head__title-prefix">16</span> ${isEdit ? "EDITAR VUELO" : "NUEVO VUELO"}
          <span class="section-head__id">MOD-16</span>
        </div>
      </header>
      ${renderStepper(step)}
      <div id="wiz-errors">${renderErrorBanner(errs)}</div>
      <div id="wiz-body">${renderStubBody(step, draft, safeCatalogs)}</div>
      <div id="wiz-footer">${renderFooter(step, busy, isEdit)}</div>
    `;
    bindFooter();
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

  render();

  return {
    getDraft: () => ({ ...draft }),
    getStep: () => step,
    goTo: (n) => {
      if (busy) return;
      if (n >= 0 && n < STEPS.length) { step = n; errs = []; render(); }
    },
    setDraft: (patch) => { draft = sanitize({ ...draft, ...patch }); },
    buildPayload,
    getStepCount: () => STEPS.length,
    destroy: () => { root.innerHTML = ""; },
  };
};
