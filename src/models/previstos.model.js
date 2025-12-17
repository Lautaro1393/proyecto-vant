import { pool } from '../config/database.js';

// GET ALL
export const getAllPrevistos = async () => {
    const [rows] = await pool.query('SELECT * FROM previstos WHERE deleted_at IS NULL');
    return rows;
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
        fecha_inicio, 
        fecha_fin, 
        solicitante,
        previstoscol || 'Planificado' // Valor por defecto
    ]);
    
    return { id_previstos: result.insertId, ...data };
};