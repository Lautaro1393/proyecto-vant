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
      root.innerHTML = "";
      const result = await r.handler({ params, path, root });
      currentTeardown = typeof result === "function" ? result : null;
      return;
    }
  }
  navigate("/404");
};
