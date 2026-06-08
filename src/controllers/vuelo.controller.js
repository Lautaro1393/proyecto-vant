import * as model from '../models/vuelo.model.js';
import { pool } from '../config/database.js';

export const listarVuelos = async (req, res) => {
    try {
        const lista = await model.getAllVuelos();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar los vuelos' });
    }
};

export const getVueloById = async (req, res) => {
    const { id } = req.params;
    try {
        const vuelo = await model.getVueloById(id);
        if (!vuelo) {
            return res.status(404).json({ error: 'Vuelo no encontrado' });
        }
        res.json(vuelo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const crearVuelo = async (req, res) => {
    const { fecha, coordenadas, tiempo_de_vuelo, proposito, clima, drones, baterias, pilotos } = req.body;

    if (!fecha || !coordenadas || !tiempo_de_vuelo || !proposito || !clima) {
        return res.status(400).json({
            error: 'Faltan datos: fecha, coordenadas, tiempo_de_vuelo, proposito y clima son obligatorios'
        });
    }
    if (!Array.isArray(drones) || drones.length === 0) {
        return res.status(400).json({ error: 'Debe asociar al menos un dron' });
    }
    if (!Array.isArray(baterias) || baterias.length === 0) {
        return res.status(400).json({ error: 'Debe asociar al menos una bateria' });
    }
    if (!Array.isArray(pilotos) || pilotos.length === 0) {
        return res.status(400).json({ error: 'Debe asociar al menos un piloto' });
    }
    if (!model.CLIMAS_VALIDOS.includes(clima)) {
        return res.status(400).json({
            error: `Clima invalido. Valores permitidos: ${model.CLIMAS_VALIDOS.join(', ')}`
        });
    }
    if (!model.TIEMPO_REGEX.test(tiempo_de_vuelo)) {
        return res.status(400).json({
            error: 'tiempo_de_vuelo debe tener formato HH:MM:SS (ej: 00:25:00)'
        });
    }

    const minutos = model.tiempoAMinutos(tiempo_de_vuelo);

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const id_vuelo = await model.crearVuelo(req.body, conn);
        await model.asociarDrones(id_vuelo, drones, conn);
        await model.asociarBaterias(id_vuelo, baterias, conn);
        await model.asociarPilotos(id_vuelo, pilotos, conn);

        for (const id_bateria of baterias) {
            await model.incrementarCiclosBateria(id_bateria, conn);
        }
        for (const id_dron of drones) {
            await model.sumarHorasDron(id_dron, minutos, conn);
        }
        for (const id_piloto of pilotos) {
            await model.sumarHorasPiloto(id_piloto, minutos, conn);
        }

        await conn.commit();
        console.log(`[POST] Vuelo ID ${id_vuelo} creado. Drones: ${drones.length}, Baterias: ${baterias.length}, Pilotos: ${pilotos.length}, Min: ${minutos}`);

        res.status(201).json({ id_vuelo, ...req.body, minutos_acumulados: minutos });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al crear el vuelo' });
    } finally {
        if (conn) conn.release();
    }
};

export const actualizarVuelo = async (req, res) => {
    const { id } = req.params;
    const { fecha, coordenadas, tiempo_de_vuelo, proposito, clima, drones, baterias, pilotos } = req.body;

    if (!fecha || !coordenadas || !tiempo_de_vuelo || !proposito || !clima) {
        return res.status(400).json({ error: 'Faltan datos obligatorios del vuelo' });
    }
    if (!Array.isArray(drones) || drones.length === 0 ||
        !Array.isArray(baterias) || baterias.length === 0 ||
        !Array.isArray(pilotos) || pilotos.length === 0) {
        return res.status(400).json({ error: 'drones, baterias y pilotos deben tener al menos un elemento' });
    }
    if (!model.CLIMAS_VALIDOS.includes(clima)) {
        return res.status(400).json({ error: 'Clima invalido' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const result = await model.modificarVuelo(id, req.body, conn);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Vuelo no encontrado' });
        }

        await model.reemplazarPivotes(id, drones, baterias, pilotos, conn);

        await conn.commit();
        console.log(`[PUT] Vuelo ID ${id} actualizado. Pivotes reemplazados (acumuladores NO tocados).`);

        res.json({ message: 'Vuelo actualizado', vuelo: { id_vuelo: id, ...req.body } });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el vuelo' });
    } finally {
        if (conn) conn.release();
    }
};

export const borrarVuelo = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await model.deleteVuelo(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vuelo no encontrado o ya eliminado' });
        }
        console.log(`[DELETE] Vuelo ID ${id} eliminado (soft delete). Acumuladores NO restados.`);
        res.json({ message: 'Vuelo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el vuelo' });
    }
};
