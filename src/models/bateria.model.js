import {pool} from '../config/database.js';

// GET ALL : Trae todas las baterias activas (que no hayan sido borradas)
export const getAllBaterias = async () => {
    const [rows] = await pool.query('SELECT * FROM bateria WHERE deleted_at IS NULL');
    return rows
};

//CREATE: Crear nueva bateria
export const crearBateria = async (data) => {
    const {numero_de_serie, voltage, capacidad, ciclos_de_carga, estado, fecha_adquisicion} = data;

    const query = `INSERT INTO bateria (numero_de_serie, voltage, capacidad, ciclos_de_carga, estado, fecha_adquisicion)
    VALUES (?,?,?,?,?,?)`;

    // Si no envían fecha, usamos la fecha actual (new Date())
    // Si no envían estado, asumimos 'DISPONIBLE' (o el valor por defecto del ENUM)
    const [result] = await pool.query(query, [
        numero_de_serie,
        voltage,
        capacidad,
        ciclos_de_carga || 0,
        estado || 'DISPONIBLE',
        fecha_adquisicion || new Date()
    ]);

    return { id_bateria: result.insertId, ...data 
    };
}