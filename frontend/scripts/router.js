// Hash router minimal — #/dashboard, #/login, #/drones/12

const routes = [];
let currentTeardown = null;

export const route = (pattern, handler) => {
  const keys = [];
  const regex = new RegExp(
    "^" +
    pattern.replace(/:([a-zA-Z_]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) +
    "$"
  );
  routes.push({ regex, keys, handler });
};

export const navigate = (to) => {
  window.location.hash = `#${to.startsWith("/") ? to : "/" + to}`;
};

export const start = async (defaultRoute) => {
  window.addEventListener("hashchange", dispatch);
  if (!window.location.hash) {
    window.location.hash = `#${defaultRoute}`;
    return;
  }
  await dispatch();
};

const renderError = (root, error) => {
  console.error("[router] Error en vista:", error);
  if (!root) return;
  const escape = (s) => String(s ?? "").replace(/[<>]/g, (c) => ({"<":"&lt;",">":"&gt;"}[c]));
  // Como la vista fallo, es posible que el shell (.app__header + nav)
  // tampoco se haya rendereado (renderShell vive dentro del handler).
  // Pintamos un shell minimo + el error para que el usuario pueda navegar.
  root.innerHTML = `
    <div class="app">
      <header class="app__header">
        <div class="app__brand">
          <span class="app__brand-dot"></span>
          <span>VANT</span>
          <span class="app__brand-id">FLEET-OPS</span>
        </div>
        <div class="app__actions">
          <a class="btn btn--ghost btn--icon" href="#/dashboard" title="Ir al dashboard">DASH</a>
        </div>
      </header>
      <main class="app__main">
        <div class="card mt-3" style="max-width:560px;margin:var(--space-4) auto">
          <div class="card__body" style="text-align:center;padding:var(--space-6)">
            <p class="label-caps accent-alert mb-2">ERROR INESPERADO</p>
            <h2 class="h2 mb-2">La vista fallo al renderizar</h2>
            <p class="dim text-sm mb-3">${escape(error && error.message ? error.message : String(error || "Error desconocido"))}</p>
            <div class="row" style="gap:var(--space-2);justify-content:center;flex-wrap:wrap">
              <a class="btn btn--primary" href="#/dashboard">VOLVER AL DASHBOARD</a>
              <button class="btn btn--secondary" id="err-reload">RECARGAR</button>
            </div>
            ${error && error.stack ? `<details class="mt-3" style="text-align:left"><summary class="dim text-sm" style="cursor:pointer">Stack trace</summary><pre class="dim text-sm" style="overflow:auto;max-height:240px;padding:var(--space-2);background:var(--surface-lowest);margin-top:var(--space-2)">${escape(error.stack)}</pre></details>` : ""}
          </div>
        </div>
      </main>
    </div>
  `;
  const btn = document.getElementById("err-reload");
  if (btn) btn.addEventListener("click", () => window.location.reload());
};

const dispatch = async () => {
  const path = (window.location.hash || "#/").slice(1) || "/";
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      if (currentTeardown) {
        try { currentTeardown(); } catch (_) {}
      }
      const root = document.getElementById("root");
      try {
        root.innerHTML = "";
        const result = await r.handler({ params, path, root });
        currentTeardown = typeof result === "function" ? result : null;
      } catch (e) {
        // No romper la app si una vista falla. Renderizar error-banner
        // y dejar la navegacion viva (el shell + nav siguen funcionando).
        currentTeardown = null;
        renderError(root, e);
      }
      return;
    }
  }
  navigate("/404");
};
