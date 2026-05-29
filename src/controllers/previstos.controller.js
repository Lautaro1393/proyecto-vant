import * as model from '../models/previstos.model.js';

export const listarPrevistos = async (req, res) => {
    try {
        const lista = await model.getAllPrevistos();
        res.json(lista);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar las planificaciones' });
    }
};

// GET BY ID
export const getPrevistoById = async (req, res) => {
    const { id } = req.params;
    try {
        const previsto = await model.getPrevistoById(id);
        if (!previsto) {
            return res.status(404).json({ error: 'Planificación no encontrada' });
        }
        res.json(previsto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// DELETE (soft delete)
export const borrarPrevisto = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await model.deletePrevisto(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Planificación no encontrada o ya eliminada' });
        }
        console.log(`[DELETE] Previsto ID ${id} eliminado (soft delete)`);
        res.json({ message: 'Planificación eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la planificación' });
    }
};

// UPDATE (PUT)
export const actualizarPrevisto = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await model.modificarPrevisto(id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Planificación no encontrada' });
        }
        console.log(`[PUT] Previsto ID ${id} actualizado`);
        res.json({ message: 'Planificación actualizada', previsto: { id_previstos: id, ...req.body } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la planificación' });
    }
};

export const crearPrevisto = async (req, res) => {
    try {
        const { nombre_clave, fecha_inicio } = req.body;
        
        if (!nombre_clave || !fecha_inicio) {
            return res.status(400).json({ error: 'Faltan datos: nombre_clave y fecha_inicio son obligatorios' });
        }
        
        const nuevo = await model.crearPrevisto(req.body);
        
        console.log(`[POST] Nueva Misión Planificada: ${nombre_clave}`);
        
        res.status(201).json(nuevo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la planificación' });
    }
};