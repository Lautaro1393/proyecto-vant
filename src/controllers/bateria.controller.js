import * as model from '../models/bateria.model.js'

// GET
export const getAllBaterias = async (req, res) => {
    try {
        const baterias = await model.getAllBaterias();
        res.json(baterias);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al obtener la lista de baterias'});
    }
};

// POST
export const crearBateria = async (req, res) => {
    try {
        const { numero_de_serie, voltage, capacidad } =req.body;

        //validacion basica
        if (!numero_de_serie){
            return res.status(400).json({error: 'Falta numero de serie de la bateria'});
        }
        const nuevaBateria = await model.crearBateria(req.body);

        // log en consola
        console.log (`[POST] Bateria creada - Serie: ${numero_de_serie} | Capacidad: ${capacidad}mAh`);
        res.status(201).json(nuevaBateria);
    } catch(error){
        console.error(error);
        // Manejo de error por duplicado (si el nro de serie es UNIQUE en la BD)
        if (error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({error: 'Ese numero de serie ya existe'});
        }
        res.status(500).json({error: 'Error al dar de alta la bateria'});
    }
};