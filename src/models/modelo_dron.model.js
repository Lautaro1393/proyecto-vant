import { pool } from '../config/database.js';

// LISTAR (GET)
export const getModelos = async () => {
    // Traemos solo los que no están borrados (si usas borrado lógico, sino quita el WHERE)
    const [rows] = await pool.query('SELECT * FROM modelo_dron');
    return rows;
};

// CREAR (POST)
export const createModelo = async (data) => {
    const { modelo, fabricante, imagenes } = data;
    
    const query = 'INSERT INTO modelo_dron (modelo, fabricante) VALUES (?, ?)';
    const [result] = await pool.query(query, [modelo, fabricante || null]);
    
    return { id_modelo_dron: result.insertId, ...data };
};