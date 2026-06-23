import { pool } from '../config/database.js';
import { formatFecha } from '../helpers/dateHelper.js';

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
        fk_bateria_id || null,
        formatFecha(fecha) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        tipo || 'Preventivo',
        descripcion,
        costo || 0,
        horas_de_vuelo || 0
    ]);

    return { id_mantenimiento: result.insertId, ...data };
};

// getById
export const getMantenimientoById = async (id) => {
    const [rows] = await pool.query(
        `SELECT m.*,
                d.matricula as dron_matricula,
                d.numero_de_serie as dron_serie,
                b.numero_de_serie as bateria_serie
         FROM mantenimiento m
         JOIN dron d ON m.dron_id = d.id_dron
         LEFT JOIN bateria b ON m.fk_bateria_id = b.id_bateria
         WHERE m.id_mantenimiento = ?`,
        [id]
    );
    return rows[0];
};

// modificar
export const modificarMantenimiento = async (id, data) => {
    const { dron_id, fk_bateria_id, fecha, tipo, descripcion, costo, horas_de_vuelo } = data;
    const fields = [];
    const values = [];
    if (dron_id !== undefined)         { fields.push("dron_id = ?");         values.push(dron_id); }
    if (fk_bateria_id !== undefined)   { fields.push("fk_bateria_id = ?");   values.push(fk_bateria_id || null); }
    if (fecha !== undefined)           { fields.push("fecha = ?");           values.push(formatFecha(fecha)); }
    if (tipo !== undefined)            { fields.push("tipo = ?");            values.push(tipo); }
    if (descripcion !== undefined)     { fields.push("descripcion = ?");     values.push(descripcion); }
    if (costo !== undefined)           { fields.push("costo = ?");           values.push(costo); }
    if (horas_de_vuelo !== undefined)  { fields.push("horas_de_vuelo = ?");  values.push(horas_de_vuelo); }

    if (fields.length === 0) return { affectedRows: 0, warning: "no fields to update" };

    const query = `UPDATE mantenimiento SET ${fields.join(", ")} WHERE id_mantenimiento = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result;
};

// eliminar
export const deleteMantenimiento = async (id) => {
    const [result] = await pool.query('DELETE FROM mantenimiento WHERE id_mantenimiento = ?', [id]);
    return result;
};