import {pool} from '../config/database.js'

//get all

export const getAllPilotos= async() =>{
    const [rows] = await pool.query('select * from piloto');
    return rows
}

// GET BY ID: Buscar uno solo por su ID
export const getPilotoByID = async (id) => {
    // Usamos '?' para evitar inyecciones SQL (seguridad básica)
    const [rows] = await pool.query('SELECT * FROM piloto WHERE id_pilotos = ?', [id]);
    return rows[0]; // Retorna el primer resultado o undefined
}

// SEARCH: Buscar por nombre (Mejorado con SQL)
export const searchPiloto = async (termino) => {
    // ILIKE no existe en MySQL estándar, usamos LIKE. 
    // Los signos % significan "cualquier texto antes o después".
    const [rows] = await pool.query('SELECT * FROM piloto WHERE nombre LIKE ?', [`%${termino}%`]);
    return rows;
}

// CREATE: Crear Piloto
export const crearPiloto = async (data)=> {
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol } = data;
    // Ejecutamos el INSERT
    const [result] = await pool.query(
        'INSERT INTO piloto (nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol]
    );
    // Devolvemos el objeto creado (OJO la pass ya viene hasheada del controller)
    return {id_pilotos: result.insertId, ...data}
}