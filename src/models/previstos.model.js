import { pool } from '../config/database.js';
import { formatFecha } from '../helpers/dateHelper.js';

// GET ALL
export const getAllPrevistos = async () => {
    const [rows] = await pool.query('SELECT * FROM previstos WHERE deleted_at IS NULL');
    return rows;
};

// GET BY ID
export const getPrevistoById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM previstos WHERE id_previstos = ? AND deleted_at IS NULL', [id]);
    return rows[0];
};

// crear
export const crearPrevisto = async (data) => {
    // Asumimos que 'previstoscol' es la prioridad o tipo. Ajusta si en tu BD es diferente.
    const { nombre_clave, descripcion, fecha_inicio, fecha_fin, solicitante, previstoscol } = data;
    
    const query = `
        INSERT INTO previstos (nombre_clave, descripcion, fecha_inicio, fecha_fin, solicitante, previstoscol)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
        nombre_clave, 
        descripcion, 
        formatFecha(fecha_inicio), 
        formatFecha(fecha_fin), 
        solicitante,
        previstoscol || 'Planificado' // Valor por defecto
    ]);
    
    return { id_previstos: result.insertId, ...data };
};

// UPDATE
export const modificarPrevisto = async (id, data) => {
    const { nombre_clave, descripcion, fecha_inicio, fecha_fin, solicitante, previstoscol } = data;

    const query = `
        UPDATE previstos 
        SET nombre_clave = ?, 
            descripcion = ?, 
            fecha_inicio = ?, 
            fecha_fin = ?, 
            solicitante = ?, 
            previstoscol = ?
        WHERE id_previstos = ? AND deleted_at IS NULL
    `;

    const [result] = await pool.query(query, [
        nombre_clave, descripcion, formatFecha(fecha_inicio), formatFecha(fecha_fin), solicitante, previstoscol, id
    ]);

    return result;
};

// DELETE (soft delete)
export const deletePrevisto = async (id) => {
    const [result] = await pool.query('UPDATE previstos SET deleted_at = NOW() WHERE id_previstos = ? AND deleted_at IS NULL', [id]);
    return result;
};