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