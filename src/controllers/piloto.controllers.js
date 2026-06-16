import * as model from '../models/pilotos.model.js'
import bcrypt from 'bcrypt'




///////////////////////  METODO GET  ////////////////////////////////
//Trae toda la tabla de pilotos

export const getAllPilotos = async (req, res) => {
    try{
        const pilotos = await model.getAllPilotos();
        res.json(pilotos)
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'Error al obtener pilotos de la BD'})
    }   
}
// ////////// GET SEARCH (Búsqueda por nombre) //////////

export const searchPiloto = async (req, res) => {
    const { nombre } = req.query; // Viene de la URL ?nombre=Lautaro
    if (!nombre) {
        return res.status(400).json({ error: 'El parámetro de búsqueda "nombre" está vacío' });
    }
    try {
        const pilotos = await model.searchPiloto(nombre);
        
        // Opcional: Si no encuentra nada, avisar con status 200 
        if (pilotos.length === 0) {
            return res.status(200).json({ message: 'No se encontraron pilotos con ese nombre' });
        }
        res.json(pilotos);
    } catch (error) {
        console.error(error); // Importante para Railway
        res.status(500).json({ error: 'Error al buscar el piloto' });
    }
};

// ////////// GET BY ID //////////

export const getPilotoByID = async (req, res) => {
    const { id } = req.params;

    try {
        const piloto = await model.getPilotoByID(id);

        if (!piloto) {
            return res.status(404).json({ error: 'Piloto no encontrado' });
        }

        res.json(piloto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al obtener el piloto' });
    }
};

//////////////// CREAR PILOTO (POST) //////////////

export const crearPiloto = async (req, res) => {
    const {nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol } = req.body;
    if (!email || !password || !nombre || !rol){
        return res.status(400).json({error: 'Faltan campos obligatorios (email, password, nombre y rol)'})
    }
    const dniNum = parseInt(dni, 10);
    if (!dniNum || isNaN(dniNum) || dniNum <= 0 || String(dni).trim() !== String(dniNum)) {
        return res.status(400).json({ error: 'DNI invalido (debe ser numerico, sin espacios ni guiones)' });
    }
    let contactoNum = null;
    if (contacto !== undefined && contacto !== null && contacto !== "") {
        contactoNum = parseInt(contacto, 10);
        if (isNaN(contactoNum) || String(contacto).trim() !== String(contactoNum)) {
            return res.status(400).json({ error: 'Contacto invalido (debe ser numerico, sin prefijos ni guiones)' });
        }
    }
    try {
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoPilotoData = {
            nombre, apellido, dni: dniNum, certificacion, vencimiento_cma, email, password: passwordHash,
            contacto: contactoNum, rol
        };
        const resultado = await model.crearPiloto(nuevoPilotoData);
        console.log(`[POST] Piloto creado ID: ${resultado.id_pilotos}`);
        const pilotoSinPass = { ...resultado };
        delete pilotoSinPass.password;
        res.status(201).json(pilotoSinPass);
    } catch (error){
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({error: 'El email ya esta registrado'})
        }
        res.status(500).json({error:'Error al crear el piloto'});
    }
}

///////////////// BORRAR PILOTO (DELETE) /////////////
export const borrarPiloto = async (req, res)=>{
    const {id} = req.params
    try {
        const resultado = await model.borrarPiloto(id);

        //verificamos si realmente se borro algo
        if (resultado.affectedRows === 0){
            return res.status(404).json({error: "No se encontro el piloto"})
        }

        console.log(`[DELETE] - piloto con ID ${id} eliminado`);
        res.status(200).json({message:'Piloto eliminado correctamente'});
    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Error al eliminar el piloto'})
    }
};

///////////// MODIFICAR PILOTO (PUT) ////////////////

export const modificarPiloto = async (req,res) => {
    const {id} = req.params;
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol } = req.body;

    const data = { nombre, apellido, certificacion, vencimiento_cma, email, rol };
    if (dni !== undefined) {
        const dniNum = parseInt(dni, 10);
        if (!dniNum || isNaN(dniNum) || dniNum <= 0) {
            return res.status(400).json({ error: 'DNI invalido (debe ser numerico)' });
        }
        data.dni = dniNum;
    }
    if (contacto !== undefined) {
        let contactoNum = null;
        if (contacto !== null && contacto !== "") {
            contactoNum = parseInt(contacto, 10);
            if (isNaN(contactoNum)) {
                return res.status(400).json({ error: 'Contacto invalido (debe ser numerico, sin prefijos ni guiones)' });
            }
        }
        data.contacto = contactoNum;
    }

    try {
        const result = await model.modificarPiloto(id, data);
        if (result.affectedRows === 0){
            return res.status(404).json({error:"Piloto no encontrado"})
        }
        const idNum = parseInt(id, 10);
        const bodySinPass = { ...req.body };
        delete bodySinPass.password;
        const pilotoActualizado = {id_pilotos: idNum, ...bodySinPass};
        console.log(`[PUT] Piloto con ID ${id} actualizado`);
        res.json({message: "Piloto actualizado correctamente", piloto:pilotoActualizado});
    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Error al actualizar el piloto'})
    }
}