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
// DELETE: borrar un piloto por ID
export const borrarPiloto = async (id) => {
    // Ejecutamos la sentencia DELETE
    const [result] = await pool.query('DELETE FROM piloto WHERE id_pilotos = ?', [id]);
    // Devolvemos el objeto 'result'. 
    // Este objeto tiene una propiedad clave llamada 'affectedRows' (filas afectadas).
    // Si affectedRows es 0, significa que no borró nada (el ID no existía).
    // Si es 1, significa que lo borró.
    return result;
}
// UPDATE: Modificar datos de un piloto (Perfil)
export const modificarPiloto = async (id, data) => {
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol } = data;

    const query = `
        UPDATE piloto 
        SET nombre = ?, 
            apellido = ?, 
            dni = ?, 
            certificacion = ?, 
            vencimiento_cma = ?, 
            email = ?, 
            contacto = ?, 
            rol = ?
        WHERE id_pilotos = ?
    `;

    // Pasamos el ID al final porque es el último signo de pregunta (?) en el WHERE
    const [result] = await pool.query(query, [
        nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, id
    ]);

    return result;
}