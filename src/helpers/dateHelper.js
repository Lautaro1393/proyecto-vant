export const formatFecha = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
};
