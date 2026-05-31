export const formatFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');
};
