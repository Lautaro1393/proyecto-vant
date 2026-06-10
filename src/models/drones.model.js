import {pool} from '../config/database.js'
import { formatFecha } from '../helpers/dateHelper.js';

// GET ALL // Trae todos los drones + nombre del modelo + apellido del piloto

export const getAllDrones = async () => {
    const query = `SELECT d.*, m.modelo as nombre_modelo, m.fabricante, p.apellido as apellido_piloto, p.nombre as nombre_piloto
        FROM dron d
        LEFT JOIN modelo_dron m ON d.id_modelo_dron = m.id_modelo_dron
        LEFT JOIN piloto p ON d.piloto_id = p.id_pilotos`;
        const [rows] = await pool.query(query);
        return rows
}

// GET BY ID: Trae un dron específico
export const getDronById = async (id) => {
    const query = `
        SELECT d.*, m.modelo as nombre_modelo, m.fabricante, p.apellido as apellido_piloto
        FROM dron d
        LEFT JOIN modelo_dron m ON d.id_modelo_dron = m.id_modelo_dron
        LEFT JOIN piloto p ON d.piloto_id = p.id_pilotos
        WHERE d.id_dron = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0]; // Retorna el objeto o undefined
}

// CREATE: Crear Dron (Para ahora pasamos null en imagen, luego pondremos Multer)
export const crearDron = async (data) => {
    const { matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, imagen, fecha_adquisicion } = data;

    const query = `
        INSERT INTO dron (matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, imagen, fecha_adquisicion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    const [result] = await pool.query(query, [
        matricula, 
        numero_de_serie, 
        estado, 
        id_modelo_dron, 
        piloto_id, 
        imagen || null, 
        formatFecha(fecha_adquisicion) || new Date().toISOString().slice(0, 19).replace('T', ' ')
    ]);

    return { id_dron: result.insertId, ...data };
}

// UPDATE: Modificar Dron
export const modificarDron = async (id, data) => {
    const { matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion, imagen } = data;

    const fields = [];
    const values = [];
    if (matricula !== undefined)        { fields.push("matricula = ?");        values.push(matricula); }
    if (numero_de_serie !== undefined)  { fields.push("numero_de_serie = ?");  values.push(numero_de_serie); }
    if (estado !== undefined && estado !== null && estado !== "") { fields.push("estado = ?"); values.push(estado); }
    if (id_modelo_dron !== undefined)   { fields.push("id_modelo_dron = ?");   values.push(id_modelo_dron); }
    if (piloto_id !== undefined)        { fields.push("piloto_id = ?");        values.push(piloto_id); }
    if (fecha_adquisicion !== undefined){ fields.push("fecha_adquisicion = ?");values.push(formatFecha(fecha_adquisicion)); }
    if (imagen !== undefined)            { fields.push("imagen = ?");           values.push(imagen); }

    if (fields.length === 0) return { affectedRows: 0, warning: "no fields to update" };

    const query = `UPDATE dron SET ${fields.join(", ")} WHERE id_dron = ?`;
    values.push(id);

    const [result] = await pool.query(query, values);
    return result;
}

// DELETE: Borrar Dron
export const deleteDron = async (id) => {
    const [result] = await pool.query('DELETE FROM dron WHERE id_dron = ?', [id]);
    return result;
}