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

        if (!modelo || !fabricante) {
            return res.status(400).json({ error: 'Faltan datos obligatorios: modelo y fabricante' });
        }

        const nuevoModelo = await model.createModelo(req.body);
        console.log(`[POST] Nuevo Modelo Creado: ${modelo} (${fabricante})`);
        res.status(201).json(nuevoModelo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el modelo' });
    }
};

export const actualizarModelo = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await model.updateModelo(id, req.body);
        if (result.affectedRows === 0) {
            const [rows] = await (await import('../config/database.js')).pool.query('SELECT * FROM modelo_dron WHERE id_modelo_dron = ?', [id]);
            if (!rows.length) return res.status(404).json({ error: 'Modelo no encontrado' });
            return res.json({ message: 'Modelo sin cambios', modelo: rows[0] });
        }
        const [rows] = await (await import('../config/database.js')).pool.query('SELECT * FROM modelo_dron WHERE id_modelo_dron = ?', [id]);
        console.log(`[PUT] Modelo ID ${id} actualizado`);
        res.json({ message: 'Modelo actualizado', modelo: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el modelo' });
    }
};

export const borrarModelo = async (req, res) => {
    const { id } = req.params;
    try {
        const enUso = await model.countDronesByModelo(id);
        if (enUso > 0) {
            return res.status(400).json({
                error: `No se puede eliminar: ${enUso} dron(es) usan este modelo`,
                drones_en_uso: enUso,
            });
        }
        const result = await model.deleteModelo(id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Modelo no encontrado' });
        console.log(`[DELETE] Modelo ID ${id} eliminado`);
        res.json({ message: 'Modelo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: hay drones que usan este modelo' });
        }
        res.status(500).json({ error: 'Error al eliminar el modelo' });
    }
};