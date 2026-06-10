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
