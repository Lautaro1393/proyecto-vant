import { api, getUser } from "../api.js";
import { navigate } from "../router.js";

// ===== Helpers de formato =====
// Las horas_vuelo_acum en BD estan en MINUTOS (no horas, el nombre miente).
// En la UI mostramos "234.5h" (1 decimal) o "1,234h" si es >= 1000.
const formatHours = (min) => {
  const n = Number(min) || 0;
  const h = n / 60;
  if (h >= 1000) return h.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  return h.toFixed(1);
};
const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

// ===== Fetch con fallback snapshot =====
// Nivel 1: API live (/api/public/landing)
// Nivel 2: JSON estatico (/assets/data/landing-snapshot.json) — regenerado en cada deploy
// Nivel 3: error total
const fetchLandingData = async () => {
  try {
    const data = await api.get("/api/public/landing");
    return { source: "live", data };
  } catch (apiErr) {
    console.warn("[landing] API cayo, usando snapshot:", apiErr.message);
  }
  try {
    const res = await fetch("/assets/data/landing-snapshot.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { source: "snapshot", data };
  } catch (snapErr) {
    console.error("[landing] Snapshot cayo:", snapErr.message);
  }
  return { source: "none", error: "No se pudieron cargar datos (API ni snapshot disponibles)" };
};

// ===== Componentes HTML =====
const kpiCard = (label, value) => `
  <div class="kpi-card">
    <div class="kpi-card__value">${escape(value)}</div>
    <div class="kpi-card__label">${escape(label)}</div>
  </div>
`;

const dronCard = (d, idx) => {
  const initials = (d.matricula || "?").replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase();
  return `
    <div class="feature-card">
      <div class="feature-card__rank">${String(idx + 1).padStart(2, "0")}</div>
      <div class="feature-card__photo">
        ${d.imagen
          ? `<img src="/uploads/${escape(d.imagen)}" alt="${escape(d.matricula)}" loading="lazy" />`
          : `<div class="feature-card__photo-placeholder">${escape(initials)}</div>`
        }
      </div>
      <div class="feature-card__body">
        <h3 class="feature-card__name">${escape(d.matricula || "—")}</h3>
        <p class="feature-card__meta">${escape(d.nombre_modelo || "—")} · ${escape(d.fabricante || "—")}</p>
      </div>
      <div class="feature-card__footer">
        <span class="feature-card__hours">${formatHours(d.horas_vuelo_acum)}<small>h vuelo</small></span>
        <span class="chip chip--${d.estado === "En Servicio" ? "safe" : d.estado === "En Mantenimiento" ? "alert" : "dim"}">
          <span class="chip__dot"></span>${escape(d.estado || "—")}
        </span>
      </div>
    </div>
  `;
};

const pilotoCard = (p, idx) => {
  const initials = ((p.nombre?.[0] || "") + (p.apellido?.[0] || "")).toUpperCase() || "?";
  const cmaVence = p.vencimiento_cma ? new Date(p.vencimiento_cma) : null;
  const cmaVigente = cmaVence ? cmaVence >= new Date() : false;
  return `
    <div class="feature-card">
      <div class="feature-card__rank">${String(idx + 1).padStart(2, "0")}</div>
      <div class="feature-card__photo">
        ${p.imagen
          ? `<img src="/uploads/${escape(p.imagen)}" alt="${escape(p.nombre)}" loading="lazy" />`
          : `<div class="feature-card__photo-placeholder">${escape(initials)}</div>`
        }
      </div>
      <div class="feature-card__body">
        <h3 class="feature-card__name">${escape(p.nombre || "—")} ${escape(p.apellido || "")}</h3>
        <p class="feature-card__meta">${escape(p.certificacion || "—")} · DNI ${escape(p.dni || "—")}</p>
      </div>
      <div class="feature-card__footer">
        <span class="feature-card__hours">${formatHours(p.horas_vuelo_acum)}<small>h vuelo</small></span>
        <span class="chip chip--${cmaVigente ? "safe" : "alert"}">
          <span class="chip__dot"></span>${cmaVigente ? "CMA OK" : "CMA VENCIDA"}
        </span>
      </div>
    </div>
  `;
};

const cacheBadge = (generatedAt) => {
  if (!generatedAt) return "";
  const d = new Date(generatedAt);
  const ts = d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return `<div class="landing__cache-badge" title="API no disponible · usando snapshot estatico">DATOS EN CACHE · ${escape(ts)}</div>`;
};

// ===== Vista principal =====
export const renderLanding = async (root) => {
  const user = getUser();
  const { source, data, error } = await fetchLandingData();

  if (source === "none") {
    root.innerHTML = `
      <div class="landing">
        <main class="landing__error">
          <div class="landing__hero-corner landing__hero-corner--tl"></div>
          <div class="landing__hero-corner landing__hero-corner--tr"></div>
          <div class="landing__hero-corner landing__hero-corner--bl"></div>
          <div class="landing__hero-corner landing__hero-corner--br"></div>
          <div class="landing__brand"><span class="landing__brand-dot"></span>VANT // FLEET-OPS</div>
          <h1 class="landing__title">SISTEMA<br/>NO DISPONIBLE</h1>
          <p class="landing__sub">${escape(error)}</p>
          <button class="btn btn--primary btn--chamfer" id="btn-retry">REINTENTAR</button>
          <p class="landing__hint">Si persiste, contacte al administrador</p>
        </main>
      </div>
    `;
    root.querySelector("#btn-retry")?.addEventListener("click", () => renderLanding(root));
    return;
  }

  const { stats, top_drones, top_pilotos, generated_at } = data;

  root.innerHTML = `
    <div class="landing">
      ${source === "snapshot" ? cacheBadge(generated_at) : ""}

      <section class="landing__hero">
        <div class="landing__hero-corner landing__hero-corner--tl"></div>
        <div class="landing__hero-corner landing__hero-corner--tr"></div>
        <div class="landing__hero-corner landing__hero-corner--bl"></div>
        <div class="landing__hero-corner landing__hero-corner--br"></div>

        <div class="landing__brand">
          <span class="landing__brand-dot"></span>
          VANT // FLEET-OPS
        </div>
        <h1 class="landing__title">TACTICAL UAV<br/>FLEET MANAGER</h1>
        <p class="landing__sub">Gestion integral de operaciones con drones</p>

        <div class="landing__cta">
          ${user
            ? `<a class="btn btn--primary btn--chamfer btn--block landing__cta-link" href="#/dashboard">IR AL DASHBOARD →</a>
               <span class="landing__hint">Bienvenido, ${escape(user.nombre || "operador")}</span>`
            : `<a class="btn btn--primary btn--chamfer btn--block landing__cta-link" href="#/login">INGRESAR AL SISTEMA →</a>
               <span class="landing__hint">Acceso restringido · personal autorizado</span>`
          }
        </div>

        <div class="landing__miniline">
          <span>${escape(stats.total_drones)} DRONES</span>
          <span class="dot">·</span>
          <span>${escape(stats.total_pilotos)} PILOTOS</span>
          <span class="dot">·</span>
          <span>${escape(stats.total_vuelos)} VUELOS</span>
          <span class="dot">·</span>
          <span>EN OPERACION</span>
        </div>
      </section>

      <section class="landing__section">
        <h2 class="landing__section-title">// OPERATIONS OVERVIEW</h2>
        <div class="landing__kpis">
          ${kpiCard("Drones en flota", stats.total_drones)}
          ${kpiCard("Pilotos activos", stats.total_pilotos)}
          ${kpiCard("Vuelos registrados", stats.total_vuelos)}
          ${kpiCard("Horas acumuladas", formatHours(stats.total_horas_min) + "h")}
        </div>
      </section>

      ${top_drones.length > 0 ? `
        <section class="landing__section">
          <h2 class="landing__section-title">// TOP 3 DRONES</h2>
          <div class="landing__grid">
            ${top_drones.map((d, i) => dronCard(d, i)).join("")}
          </div>
        </section>
      ` : ""}

      ${top_pilotos.length > 0 ? `
        <section class="landing__section">
          <h2 class="landing__section-title">// TOP 3 PILOTOS</h2>
          <div class="landing__grid">
            ${top_pilotos.map((p, i) => pilotoCard(p, i)).join("")}
          </div>
        </section>
      ` : ""}

      <footer class="landing__footer">
        <div class="stack">NODE.JS <span style="color:var(--primary)">·</span> EXPRESS 5 <span style="color:var(--primary)">·</span> MYSQL <span style="color:var(--primary)">·</span> VANILLA JS</div>
        <div class="repo">github.com/Lautaro1393/proyecto-vant</div>
        <div class="copy">© 2026 · LAUTARO SARMIENTO</div>
      </footer>
    </div>
  `;
};
