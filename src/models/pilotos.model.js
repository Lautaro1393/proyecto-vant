import {pool} from '../config/database.js'
import { formatFecha } from '../helpers/dateHelper.js';

const PILOTO_SAFE_COLUMNS =
  'id_pilotos, nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, horas_vuelo_acum, deleted_at';

//get all

export const getAllPilotos= async() =>{
    const [rows] = await pool.query(
        `SELECT ${PILOTO_SAFE_COLUMNS} FROM piloto WHERE deleted_at IS NULL`
    );
    return rows
}

// GET BY ID: Buscar uno solo por su ID
export const getPilotoByID = async (id) => {
    const [rows] = await pool.query(
        `SELECT ${PILOTO_SAFE_COLUMNS} FROM piloto WHERE id_pilotos = ? AND deleted_at IS NULL`,
        [id]
    );
    return rows[0];
}

// SEARCH: Buscar por nombre (Mejorado con SQL)
export const searchPiloto = async (termino) => {
    const [rows] = await pool.query(
        `SELECT ${PILOTO_SAFE_COLUMNS} FROM piloto WHERE nombre LIKE ? AND deleted_at IS NULL`,
        [`%${termino}%`]
    );
    return rows;
}

// CREATE: Crear Piloto
export const crearPiloto = async (data)=> {
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol } = data;
    const [result] = await pool.query(
        'INSERT INTO piloto (nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, dni, certificacion, formatFecha(vencimiento_cma), email, password, contacto, rol]
    );
    return {id_pilotos: result.insertId, ...data}
}
// DELETE: soft-delete
export const borrarPiloto = async (id) => {
    const [result] = await pool.query(
        'UPDATE piloto SET deleted_at = NOW() WHERE id_pilotos = ? AND deleted_at IS NULL',
        [id]
    );
    return result;
}
// UPDATE: Modificar datos de un piloto (Perfil)
export const modificarPiloto = async (id, data) => {
    const fields = [];
    const values = [];
    if (data.nombre !== undefined)         { fields.push("nombre = ?");         values.push(data.nombre); }
    if (data.apellido !== undefined)      { fields.push("apellido = ?");      values.push(data.apellido); }
    if (data.dni !== undefined)           { fields.push("dni = ?");           values.push(data.dni); }
    if (data.certificacion !== undefined) { fields.push("certificacion = ?"); values.push(data.certificacion); }
    if (data.vencimiento_cma !== undefined){ fields.push("vencimiento_cma = ?"); values.push(formatFecha(data.vencimiento_cma)); }
    if (data.email !== undefined)         { fields.push("email = ?");         values.push(data.email); }
    if (data.contacto !== undefined)      { fields.push("contacto = ?");      values.push(data.contacto); }
    if (data.rol !== undefined)           { fields.push("rol = ?");           values.push(data.rol); }
    if (data.password !== undefined && data.password !== "") { fields.push("password = ?"); values.push(data.password); }

    if (fields.length === 0) return { affectedRows: 0, warning: "no fields to update" };

    const query = `UPDATE piloto SET ${fields.join(", ")} WHERE id_pilotos = ? AND deleted_at IS NULL`;
    values.push(id);

    const [result] = await pool.query(query, values);
    return result;
}