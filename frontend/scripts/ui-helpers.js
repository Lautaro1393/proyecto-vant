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

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toISOString().slice(0, 10);
};

export const formatDateInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
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

export const TIEMPO_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
export const COORDS_REGEX = /^-?\d{1,3}\.?\d*,-?\d{1,3}\.?\d*$/;

export const segBar = (pct, total = 10) => {
  const on = Math.round((pct / 100) * total);
  const segs = Array.from({ length: total }, (_, i) => {
    const cls = i < on
      ? (pct < 25 ? "segbar__seg--alert" : pct < 50 ? "segbar__seg--caution" : "segbar__seg--on")
      : "";
    return `<div class="segbar__seg ${cls}"></div>`;
  });
  return `<div class="segbar">${segs.join("")}</div>`;
};
