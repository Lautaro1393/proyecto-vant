import * as model from '../models/drones.model.js'; //

// GET ALL
export const getAllDrones = async (req, res) => {
    try {
        const drones = await model.getAllDrones();
        res.json(drones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de drones' });
    }
};

// GET BY ID
export const getDronById = async (req, res) => {
    const { id } = req.params;
    try {
        const dron = await model.getDronById(id);
        if (!dron) {
            return res.status(404).json({ error: 'Dron no encontrado' });
        }
        res.json(dron);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// CREATE (POST)
export const crearDron = async (req, res) => {
    const { matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion } = req.body;

    // Validación básica
    if (!matricula || !numero_de_serie || !id_modelo_dron) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (matricula, serie, modelo)' });
    }

    try {
        const nuevoDron = await model.crearDron({
            matricula, 
            numero_de_serie, 
            estado, 
            id_modelo_dron, 
            piloto_id, 
            fecha_adquisicion,
            imagen: null // Por ahora null, en el próximo paso pondremos el archivo
        });

        console.log(`[POST] Dron creado ID: ${nuevoDron.id_dron}`);
        res.status(201).json(nuevoDron);

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La matrícula o número de serie ya existen' });
        }
        res.status(500).json({ error: 'Error al crear el dron' });
    }
};

// UPDATE (PUT)
export const actualizarDron = async (req, res) => {
    const { id } = req.params;
    const { matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion } = req.body;

    try {
        const result = await model.modificarDron(id, {
            matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dron no encontrado' });
        }

        const dronActualizado = { id_dron: id, ...req.body };
        console.log(`[PUT] Dron ID ${id} actualizado`);
        res.json({ message: 'Dron actualizado', dron: dronActualizado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el dron' });
    }
};

// DELETE
export const borrarDron = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await model.deleteDron(id);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dron no encontrado' });
        }

        console.log(`[DELETE] Dron ID ${id} eliminado`);
        res.json({ message: 'Dron eliminado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el dron' });
    }
};