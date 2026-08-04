// Helpers compartidos entre vistas

export const ESTADOS_DRON = [
  { key: "todos",                 label: "TODOS" },
  { key: "en servicio",           label: "EN SERVICIO" },
  { key: "en mantenimiento",      label: "EN MANTENIMIENTO" },
  { key: "fuera de servicio",     label: "FUERA DE SERVICIO" },
];

export const ESTADOS_DRON_OPTIONS = [
  { value: "",                      label: "-- SIN ESPECIFICAR --" },
  { value: "En Servicio",           label: "En Servicio" },
  { value: "En Mantenimiento",      label: "En Mantenimiento" },
  { value: "Fuera de Servicio",     label: "Fuera de Servicio" },
];

export const ROLES = [
  { key: "todos",    label: "TODOS" },
  { key: "admin",    label: "ADMIN" },
  { key: "usuario",  label: "USUARIO" },
];

export const ROL_OPTIONS = [
  { value: "",          label: "-- SELECCIONAR --" },
  { value: "Admin",     label: "Admin" },
  { value: "Usuario",   label: "Usuario" },
];

export const chipForEstado = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("mantenimiento")) return `<span class="chip chip--alert"><span class="chip__dot"></span>EN MANTENIMIENTO</span>`;
  if (e.includes("fuera"))         return `<span class="chip chip--caution"><span class="chip__dot"></span>FUERA DE SERVICIO</span>`;
  if (e.includes("servicio"))      return `<span class="chip chip--safe"><span class="chip__dot"></span>EN SERVICIO</span>`;
  return `<span class="chip chip--dim"><span class="chip__dot"></span>${estado || "—"}</span>`;
};

export const matchEstado = (estado, filter) => {
  if (filter === "todos") return true;
  return (estado || "").toLowerCase() === filter;
};

export const chipForRol = (rol) => {
  const r = (rol || "").toLowerCase();
  if (r === "admin") return `<span class="chip chip--olive"><span class="chip__dot"></span>ADMIN</span>`;
  if (r === "usuario") return `<span class="chip chip--dim"><span class="chip__dot"></span>USUARIO</span>`;
  return `<span class="chip chip--dim"><span class="chip__dot"></span>${rol || "—"}</span>`;
};

export const formatCMAEstado = (vencimiento) => {
  if (!vencimiento) return { label: "SIN CMA", cls: "chip--dim", days: null };
  const d = new Date(vencimiento);
  if (isNaN(d)) return { label: "FECHA INVALIDA", cls: "chip--alert", days: null };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffMs = d - hoy;
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0)  return { label: `VENCIDA (${Math.abs(days)}d)`, cls: "chip--alert",   days };
  if (days <= 30) return { label: `POR VENCER (${days}d)`,     cls: "chip--caution", days };
  return { label: "VIGENTE", cls: "chip--safe", days };
};

export const chipForCMA = (vencimiento) => {
  const c = formatCMAEstado(vencimiento);
  return `<span class="chip ${c.cls}"><span class="chip__dot"></span>CMA ${c.label}</span>`;
};

export const initials = (nombre, apellido) => {
  const n = (nombre || "").trim();
  const a = (apellido || "").trim();
  if (!n && !a) return "?";
  return ((n[0] || "") + (a[0] || "")).toUpperCase();
};

// Helper: asegura que un string ISO/datetime se parsee como UTC.
// MySQL devuelve "YYYY-MM-DD HH:MM:SS" sin TZ (asume UTC por la config
// process.env.TZ = 'UTC' del server). Si lo parseamos directo con
// new Date() el browser lo interpreta como local, generando un
// desplazamiento. Anado 'Z' si no tiene TZ explicita.
const parseAsUTC = (s) => {
  if (!s) return null;
  const str = String(s);
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) return new Date(str);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return new Date(str.replace(" ", "T") + "Z");
  return new Date(str);
};

// Para campos DATE (sin hora), extrae los componentes directamente
// del string ISO para evitar el shift de TZ (ej. "2026-07-01T00:00:00Z"
// en zona UTC-3 se mostraria como "30/06/2026" si usamos toLocaleString).
const toLocalParts = (iso) => {
  if (!iso) return null;
  const s = String(iso);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  const d = parseAsUTC(iso);
  if (!d || isNaN(d)) return null;
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
};

const pad2 = (n) => String(n).padStart(2, "0");

// Fecha local en formato DD/MM/YYYY. Para campos DATE (sin hora) del backend.
export const formatDate = (iso) => {
  if (!iso) return "—";
  const p = toLocalParts(iso);
  if (!p) return iso;
  return `${pad2(p.d)}/${pad2(p.m)}/${p.y}`;
};

// Fecha local en formato YYYY-MM-DD para popular <input type="date">.
// Devuelve la fecha LOCAL (no UTC) para mantener consistencia con formatDate.
export const formatDateInput = (iso) => {
  if (!iso) return "";
  const p = toLocalParts(iso);
  if (!p) return "";
  return `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;
};

// Fecha + hora local en formato DD/MM/YYYY HH:MM. Para campos DATETIME.
export const formatDateTimeLocal = (iso) => {
  if (!iso) return "—";
  const d = parseAsUTC(iso);
  if (!d || isNaN(d)) return iso;
  return d.toLocaleString("es-AR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

// Solo hora local HH:MM. Para campos TIME o DATETIME cuando solo
// importa la hora del momento.
export const formatTimeLocal = (iso) => {
  if (!iso) return "—";
  const d = parseAsUTC(iso);
  if (!d || isNaN(d)) return iso;
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
};

export const parseVueloIds = (csv) => {
  if (csv == null) return [];
  return String(csv).split(",").map((s) => Number(s.trim())).filter(Boolean);
};

export const CLIMAS_OPTIONS = [
  { value: "Despejado",            label: "DESPEJADO" },
  { value: "Parcialmente Nublado", label: "PARCIALMENTE NUBLADO" },
  { value: "Nublado",              label: "NUBLADO" },
  { value: "Lluvia Ligera",        label: "LLUVIA LIGERA" },
  { value: "Lluvia Fuerte",        label: "LLUVIA FUERTE" },
  { value: "Viento Fuerte",        label: "VIENTO FUERTE" },
  { value: "Niebla",               label: "NIEBLA" },
];

export const ESTADOS_VUELO = [
  { value: "Realizado",  label: "REALIZADO" },
  { value: "Cancelado",  label: "CANCELADO" },
  { value: "Suspendido", label: "SUSPENDIDO" },
];

export const ESTADOS_VUELO_OPTIONS = [
  { value: "",  label: "-- SIN ESPECIFICAR --" },
  ...ESTADOS_VUELO,
];

export const TIEMPO_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
export const COORDS_REGEX = /^-?\d{1,3}\.?\d*,-?\d{1,3}\.?\d*$/;

export const segBar = (pct, total = 10) => {
  const on = Math.round((pct / 100) * total);
  const segs = Array.from({ length: total }, (_, i) => {
    if (i >= on) return `<div class="segbar__seg"></div>`;
    const cls = pct < 50  ? "segbar__seg--on"
              : pct < 80  ? "segbar__seg--caution"
              :              "segbar__seg--alert";
    return `<div class="segbar__seg ${cls}"></div>`;
  });
  return `<div class="segbar">${segs.join("")}</div>`;
};
