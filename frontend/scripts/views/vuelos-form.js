import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { navigate } from "../router.js";
import { createWizard } from "../vuelos-wizard.js";

const safe = async (fn, fb = null) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

const showFatal = (main, msg) => {
  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/vuelos" style="align-self:flex-start">← VOLVER A OPERACIONES</a>
    <div class="card mt-3"><div class="card__body error-banner">${msg}</div></div>
  `;
};

export const renderVuelosForm = async (root, opts = {}) => {
  const user = getUser();
  if (user?.rol?.toLowerCase() !== "admin") {
    navigate("/vuelos");
    return;
  }

  const isEdit = !!opts.id;
  const titlePrefix = isEdit ? "16" : "16";

  root.innerHTML = renderShell({
    titlePrefix,
    title: isEdit ? "EDITAR VUELO" : "NUEVO VUELO",
    id: "MOD-16",
    user,
  });
  const main = bindShell(root, user);
  main.innerHTML = `
    <a class="btn btn--ghost btn--sm" href="#/vuelos" style="align-self:flex-start">← CANCELAR</a>
    <div id="wiz-host" style="min-height:200px">
      <div class="card"><div class="card__body" style="display:flex;gap:var(--space-2);align-items:center">
        <span class="spinner"></span><span class="dim">Cargando catalogos...</span>
      </div></div>
    </div>
  `;

  const [drones, baterias, pilotos, previstos, vueloExistente] = await Promise.all([
    safe(() => api.get("/api/drones"), []),
    safe(() => api.get("/api/baterias"), []),
    safe(() => api.get("/api/pilotos"), []),
    safe(() => api.get("/api/previstos"), []),
    isEdit ? safe(() => api.get(`/api/vuelos/${opts.id}`)) : Promise.resolve(null),
  ]);

  if (isEdit && !vueloExistente) {
    showFatal(main, "VUELO NO ENCONTRADO");
    return;
  }

  const initialData = isEdit && vueloExistente ? {
    drones: (vueloExistente.drones || []).map((d) => d.id_dron),
    baterias: (vueloExistente.baterias || []).map((b) => b.id_bateria),
    pilotos: (vueloExistente.pilotos || []).map((p) => p.id_pilotos),
    fecha: (vueloExistente.fecha || "").slice(0, 10),
    tiempo_de_vuelo: vueloExistente.tiempo_de_vuelo || "",
    coordenadas: vueloExistente.coordenadas || "",
    proposito: vueloExistente.proposito || "",
    clima: vueloExistente.clima || "Despejado",
    observaciones: vueloExistente.observaciones || "",
    estado: vueloExistente.estado || "Realizado",
    previsto_id: vueloExistente.previsto_id || null,
  } : {};

  const wizHost = main.querySelector("#wiz-host");
  wizHost.innerHTML = "";

  const wizard = createWizard({
    root: wizHost,
    isEdit,
    initialData,
    catalogs: { drones, baterias, pilotos, previstos },
    onSubmit: async (payload) => {
      try {
        const res = isEdit
          ? await api.put(`/api/vuelos/${opts.id}`, payload)
          : await api.post("/api/vuelos", payload);
        const id = res?.id_vuelo || opts.id;
        navigate(`/vuelos/${id}`);
      } catch (e) {
        throw e;
      }
    },
    onCancel: () => { navigate("/vuelos"); },
  });
};
