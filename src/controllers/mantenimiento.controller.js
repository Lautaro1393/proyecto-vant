import * as mantenimientoModel from '../models/mantenimiento.model.js';
import { pool } from '../config/database.js'; 

// GET
export const listarMantenimientos = async (req, res) => {
    try {
        const lista = await mantenimientoModel.getAllMantenimientos();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar mantenimientos' });
    }
};

// POST (La Impronta Personal)
export const registrarMantenimiento = async (req, res) => {
    try {
        const { dron_id, descripcion } = req.body;

        // 1. Validar datos mínimos
        if (!dron_id || !descripcion) {
            return res.status(400).json({ error: 'Faltan datos: dron_id y descripcion son obligatorios' });
        }

        // 2. Crear el registro de mantenimiento en la BD
        const nuevoMantenimiento = await mantenimientoModel.crearMantenimiento(req.body);

        // 3. ACTUALIZACIÓN AUTOMÁTICA: Cambiar estado del Dron
        // Usamos "En Mantenimiento" tal cual figura en tu base de datos
        await pool.query('UPDATE dron SET estado = ? WHERE id_dron = ?', ['En Mantenimiento', dron_id]);

        console.log(`[POST] Mantenimiento ID ${nuevoMantenimiento.id_mantenimiento} creado. Dron ID ${dron_id} pasó a 'En Mantenimiento'.`);

        res.status(201).json({
            message: 'Mantenimiento registrado y estado del Dron actualizado',
            data: nuevoMantenimiento
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar mantenimiento' });
    }
};