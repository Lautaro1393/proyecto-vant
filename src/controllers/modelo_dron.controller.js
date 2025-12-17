import * as model from '../models/modelo_dron.model.js';

export const listarModelos = async (req, res) => {
    try {
        const modelos = await model.getModelos();
        res.json(modelos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar modelos de drones' });
    }
};

export const crearModelo = async (req, res) => {
    try {
        const { modelo, fabricante } = req.body;
        
        // Validación básica
        if (!modelo || !fabricante) {
            return res.status(400).json({ error: 'Faltan datos obligatorios: modelo y fabricante' });
        }

        const nuevoModelo = await model.createModelo(req.body);
        
        // REQUISITO DE EVALUACIÓN: Mostrar en consola
        console.log(`[POST] Nuevo Modelo Creado: ${modelo} (${fabricante})`);
        
        res.status(201).json(nuevoModelo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el modelo' });
    }
};