import * as model from '../models/drones.model.js'; //
import multer from "multer";

const ESTADOS_VALIDOS = ["En Servicio", "En Mantenimiento", "Fuera de Servicio"];

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

    // Obtenemos el nombre del archivo.
    // Si req.file existe, guardamos el nombre. Si no, guardamos null.
    const imagen = req.file ? req.file.filename : null;

    // Validación básica
    if (!matricula || !numero_de_serie || !id_modelo_dron) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (matricula, serie, modelo)' });
    }
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    try {
        const nuevoDron = await model.crearDron({
            matricula,
            numero_de_serie,
            estado,
            id_modelo_dron,
            piloto_id,
            fecha_adquisicion,
            imagen: imagen
        });

        console.log(`[POST] Dron creado ID: ${nuevoDron.id_dron} | Imagen: ${imagen}`);
        res.status(201).json(nuevoDron);

    } catch (error) {
        console.error(`[POST] Dron fallo:`, error.sqlMessage || error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La matrícula o número de serie ya existen' });
        }
        const msg = error.code === 'WARN_DATA_TRUNCATED'
            ? 'Uno de los valores no es valido (ej. estado fuera del ENUM permitido)'
            : (error.sqlMessage || 'Error al crear el dron');
        const status = error.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500;
        res.status(status).json({ error: msg, code: error.code });
    }
};

// Multer puede tirar errores que no son atrapados por el try/catch del controller.
// Handler global de multer errors para devolver 400 legible.
export const handleMulterError = (err, req, res, next) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'La imagen supera el limite de 5MB' });
        }
        return res.status(400).json({ error: `Error de upload: ${err.message}` });
    }
    // fileFilter custom errors llegan como Error plano
    if (err.message && /imagen/i.test(err.message)) {
        return res.status(400).json({ error: 'La imagen debe ser JPG, PNG o GIF' });
    }
    return next(err);
};

// UPDATE (PUT)
export const actualizarDron = async (req, res) => {
    const { id } = req.params;
    const { matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion } = req.body || {};

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    // Si multer proceso un archivo, tenemos req.file con el nombre
    const imagen = req.file ? req.file.filename : undefined;

    try {
        const result = await model.modificarDron(id, {
            matricula, numero_de_serie, estado, id_modelo_dron, piloto_id, fecha_adquisicion,
            imagen
        });

        if (result.affectedRows === 0) {
            const actual = await model.getDronById(id);
            if (!actual) {
                return res.status(404).json({ error: 'Dron no encontrado' });
            }
            return res.json({ message: 'Dron sin cambios', dron: actual });
        }

        const dronActualizado = await model.getDronById(id);
        console.log(`[PUT] Dron ID ${id} actualizado${imagen ? ' | imagen: ' + imagen : ''}`);
        res.json({ message: 'Dron actualizado', dron: dronActualizado });

    } catch (error) {
        console.error(`[PUT] Dron ID ${id} fallo:`, error.sqlMessage || error.message);
        const msg = error.code === 'WARN_DATA_TRUNCATED'
            ? 'Uno de los valores enviados no es valido para el campo correspondiente (ej. estado fuera del ENUM)'
            : (error.sqlMessage || 'Error al actualizar el dron');
        const status = error.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500;
        res.status(status).json({ error: msg, code: error.code });
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