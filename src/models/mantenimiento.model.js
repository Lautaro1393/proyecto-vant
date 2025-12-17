import { pool } from '../config/database.js';

// GET ALL: Trae mantenimiento + matrícula del dron + serie de batería (si hay)
export const getAllMantenimientos = async () => {
    const query = `
        SELECT m.*, 
               d.matricula as dron_matricula, 
               d.numero_de_serie as dron_serie,
               b.numero_de_serie as bateria_serie
        FROM mantenimiento m
        JOIN dron d ON m.dron_id = d.id_dron
        LEFT JOIN bateria b ON m.fk_bateria_id = b.id_bateria
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// crear: Registra mantenimiento
export const crearMantenimiento = async (data) => {
    const { dron_id, fk_bateria_id, fecha, tipo, descripcion, costo, horas_de_vuelo } = data;
    
    const query = `
        INSERT INTO mantenimiento (dron_id, fk_bateria_id, fecha, tipo, descripcion, costo, horas_de_vuelo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
        dron_id, 
        fk_bateria_id || null, // Si no envían batería, guarda NULL
        fecha || new Date(), 
        tipo || 'Preventivo', 
        descripcion, 
        costo || 0,
        horas_de_vuelo || 0
    ]);
    
    return { id_mantenimiento: result.insertId, ...data };
};