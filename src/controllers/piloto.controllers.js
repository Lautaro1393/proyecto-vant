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
    const { id_pilotos } = req.params; // Viene de la URL /pilotos/1

    try {
        const piloto = await model.getPilotoByID(id_pilotos);

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
    //1 Recepcion de datos
    const {nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol } = req.body;
    //2. Validacion basica
    if (!email || !password || !nombre || !rol){
        return res.status(400).json({error: 'Faltan campos obligatorios (email, password, nombre y rol)'})
    }
    try {
        //3. encriptacion de contraseña
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt); // encriptamos
        //4. Preparamos los datos para el modelo (usando la pass ya encriptada)
        const nuevoPilotoData = {
            nombre, apellido, dni, certificacion, vencimiento_cma, email, password: passwordHash,
            contacto, rol
        };
        //5. llamada al modelo
        const resultado = await model.crearPiloto(nuevoPilotoData);
        //6. Respuesta exitosa (201 Created)
        console.log(`[POST] Piloto creado ID: ${resultado.id_pilotos}`);
        res.status(201).json(resultado);
    } catch (error){
        console.error(error);
        // Si el error es por email duplicado (Codigo ER_DUP_ENTRY de MySQL)
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
    // Obtenemos los datos del body (sin password)
   const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol } = req.body; 
   try {
    // Llamamos al modelo
    const result = await model.modificarPiloto(id, {nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol});

    // Verificamos si se toco alguna fila
    if (result.affectedRows === 0){
        return res.status(404).json({error:"Piloto no encontrado"})
    }

    // Armamos el objeto de respuesta
    const pilotoActualizado = {id_pilotos: id, ...req.body};

    console.log(`[PUT] Piloto con ID ${id} actualizado`);
    res.json({message: "Piloto actualizado correctamente", piloto:pilotoActualizado});

   } catch(error){
    console.error(error);
    res.status(500).json({error: 'Error al actualizar el piloto'})
   }
}