import * as mantenimientoModel from '../models/mantenimiento.model.js';
import { pool } from '../config/database.js';

const TIPOS_VALIDOS = ['Preventivo', 'Correctivo', 'Actualizacion de Firmware', 'Calibracion'];

// GET ALL
export const listarMantenimientos = async (req, res) => {
    try {
        const lista = await mantenimientoModel.getAllMantenimientos();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar mantenimientos' });
    }
};

// GET BY ID
export const getMantenimientoById = async (req, res) => {
    const { id } = req.params;
    try {
        const m = await mantenimientoModel.getMantenimientoById(id);
        if (!m) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
        res.json(m);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener mantenimiento' });
    }
};

// POST
export const registrarMantenimiento = async (req, res) => {
    try {
        const { dron_id, fk_bateria_id, fecha, tipo, descripcion, costo, horas_de_vuelo } = req.body;

        if (!dron_id || !fecha) {
            return res.status(400).json({ error: 'Faltan datos: dron_id y fecha son obligatorios' });
        }
        if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({ error: `Tipo invalido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}` });
        }

        const nuevoMantenimiento = await mantenimientoModel.crearMantenimiento(req.body);

        // Side-effect: dron pasa a "En Mantenimiento" automaticamente
        await pool.query('UPDATE dron SET estado = ? WHERE id_dron = ?', ['En Mantenimiento', dron_id]);

        console.log(`[POST] Mantenimiento ID ${nuevoMantenimiento.id_mantenimiento} creado. Dron ID ${dron_id} pasó a 'En Mantenimiento'.`);

        res.status(201).json({
            message: 'Mantenimiento registrado y estado del Dron actualizado',
            data: nuevoMantenimiento
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'dron_id o fk_bateria_id no existe' });
        }
        if (error.code === 'WARN_DATA_TRUNCATED') {
            return res.status(400).json({ error: 'Tipo invalido (debe ser uno de los valores del ENUM)' });
        }
        res.status(500).json({ error: 'Error al registrar mantenimiento' });
    }
};

// PUT
export const actualizarMantenimiento = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await mantenimientoModel.modificarMantenimiento(id, req.body);
        if (result.affectedRows === 0) {
            const m = await mantenimientoModel.getMantenimientoById(id);
            if (!m) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
            return res.json({ message: 'Mantenimiento sin cambios', mantenimiento: m });
        }
        const actualizado = await mantenimientoModel.getMantenimientoById(id);
        console.log(`[PUT] Mantenimiento ID ${id} actualizado`);
        res.json({ message: 'Mantenimiento actualizado', mantenimiento: actualizado });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'dron_id o fk_bateria_id no existe' });
        }
        if (error.code === 'WARN_DATA_TRUNCATED') {
            return res.status(400).json({ error: 'Tipo invalido' });
        }
        res.status(500).json({ error: 'Error al actualizar mantenimiento' });
    }
};

// DELETE
export const borrarMantenimiento = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await mantenimientoModel.deleteMantenimiento(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
        console.log(`[DELETE] Mantenimiento ID ${id} eliminado`);
        res.json({ message: 'Mantenimiento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar mantenimiento' });
    }
};