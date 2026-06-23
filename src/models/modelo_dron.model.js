import { pool } from '../config/database.js';

// LISTAR (GET)
export const getModelos = async () => {
    // Traemos solo los que no están borrados (si usas borrado lógico, sino quita el WHERE)
    const [rows] = await pool.query('SELECT * FROM modelo_dron');
    return rows;
};

// CREAR (POST)
export const createModelo = async (data) => {
    const { modelo, fabricante } = data;

    const query = 'INSERT INTO modelo_dron (modelo, fabricante) VALUES (?, ?)';
    const [result] = await pool.query(query, [modelo, fabricante || null]);

    return { id_modelo_dron: result.insertId, ...data };
};

// MODIFICAR (PUT)
export const updateModelo = async (id, data) => {
    const { modelo, fabricante } = data;
    const fields = [];
    const values = [];
    if (modelo !== undefined)     { fields.push("modelo = ?");     values.push(modelo); }
    if (fabricante !== undefined)  { fields.push("fabricante = ?"); values.push(fabricante || null); }
    if (fields.length === 0) return { affectedRows: 0, warning: "no fields to update" };
    const query = `UPDATE modelo_dron SET ${fields.join(", ")} WHERE id_modelo_dron = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result;
};

// ELIMINAR (DELETE)
export const deleteModelo = async (id) => {
    const [result] = await pool.query('DELETE FROM modelo_dron WHERE id_modelo_dron = ?', [id]);
    return result;
};

// CONTAR DRONES que usan este modelo (para check de integridad en DELETE)
export const countDronesByModelo = async (id) => {
    const [rows] = await pool.query('SELECT COUNT(*) as n FROM dron WHERE id_modelo_dron = ?', [id]);
    return rows[0]?.n || 0;
};