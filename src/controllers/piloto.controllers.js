// import { getAllPilotos } from "../services/pilotos.service.js"; 
// import * as service from '../services/pilotos.service.js'
import * as model from '../models/pilotos.model.js'

///////////////////////  METODO GET  ////////////////////////////////


//Trae toda la tabla 

export const getAllPilotos = (req, res) => {
    res.json(model.getAllPilotos());
    console.log(model.getAllPilotos())
}
//SEARCH  busqueda por nombre del piloto/////////////////

export const searchPiloto = (req,res)=>{
    const {nombre} = req.query;
    if(!nombre){
        return res.status(400).json({error: 'el parametro de busqueda nombre esta vacio'})
    }
    const pilotos = model.getAllPilotos();
    const pilotoFiltrado = pilotos.filter((piloto)=> piloto.nombre.toLowerCase().includes(nombre.toLocaleLowerCase())
);
console.log(req.query);
res.json(pilotoFiltrado)
};


//GET por ID del piloto//////////////////

export const getPilotoByID = (req,res)=>{
    const {id_pilotos} = req.params
    // const piloto = pilotos.find((item) =>  item.id_pilotos == id_pilotos);
    const piloto = model.getPilotoByID(id_pilotos);
    
    console.log(piloto);
    if(!piloto){
        console.log('Error 404: Piloto no encotrado')
        return res.status(404).json({error: "'Piloto no encontrado"});
        
    }
    res.json(piloto);
};

////////////// Crear Piloto ///////////////


export const crearPiloto = (req, res)=>{
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At} = req.body; // DESESTRUCTURACION de objetos

    // 1. VALIDACIÓN: Revisar si faltan campos OBLIGATORIOS.
    if (!nombre || !apellido || !certificacion || !email || !rol) {
        // Si falta algún dato, se devuelve el error y el 'return' finaliza la función aquí.
        return res.status(400).json({Error: 'Faltan datos en el body'}); 
    }
    
    // 2. LÓGICA DE NEGOCIO (Solo si la validación es exitosa)
    // Ahora, si los datos son válidos, llamamos al modelo para crear y guardar el registro.
    const nuevoPiloto = model.crearPiloto ({
        nombre, 
        apellido, 
        dni, 
        certificacion,
        vencimiento_cma, 
        email, 
        contacto, 
        rol, 
        deleted_At
    });

    // 3. RESPUESTA EXITOSA (Solo si se creó el registro)
    console.log(nuevoPiloto);
    res.status(201).json (nuevoPiloto);
};

// modificar piloto mediante metodo PUT
/* 
export const modificarPiloto=(req,res)=>{
    const pilotos = model.getAllPilotos();
    const idPiloto = parseInt(req.params.id, 10);
    // const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos == idPiloto);   
    const pilotoIndex = model.actualizarPiloto(idPiloto);
    if(pilotoIndex === -1){
        return res.status(404).json({error: 'Piloto no encontrado'});
    } 
    const { nombre, apellido, dni,certificacion, vencimiento_cma, email, contacto, rol, deleted_At} = req.body // obteniendo los datos del body 
    const pilotoActualizado ={
        id_pilotos : idPiloto,
        nombre,
        apellido,
        dni,
        certificacion,
        vencimiento_cma,
        email,
        contacto,
        rol,
        deleted_At
    };
    pilotos[pilotoIndex]= pilotoActualizado;
    console.log(`el piloto fue actualizado con exito`, pilotoActualizado)
    res.json(pilotos[pilotoIndex])
    
};
 */

// metodo delete  ///////////

export const borrarPiloto = (req,res) => {
const idPiloto = parseInt(req.params.id, 10);
// console.log(idPiloto, "este es el id que paso en la peticion");
const piloto = model.borrarPiloto(idPiloto);
if (!piloto) {
    return res.status(404).json({error: 'Piloto no encontrado'});

}
res.status(204).send({mensaje: 'Producto eliminado'})
console.log(`piloto con id ${idPiloto} ha sido eliminado`)
}


//////////// Modificar Piloto  PUT ///////////////

export const modificarPiloto = (req,res) => {
    const idPiloto = parseInt(req.params.id, 10);
    console.log(idPiloto)
    const { nombre, apellido, dni,certificacion, vencimiento_cma, email, contacto, rol, deleted_At} = req.body;
    const actualizarPiloto = model.getPilotoByID(idPiloto);
    if (!actualizarPiloto) {
        return res.status(404).json({error: 'Piloto no encontrado'});
    }
    actualizarPiloto.nombre = nombre !== undefined ? nombre : actualizarPiloto.name;
    actualizarPiloto.apellido = apellido !== undefined ? apellido : actualizarPiloto.apellido;
    actualizarPiloto.dni = dni !== undefined ? dni : actualizarPiloto.dni;
    actualizarPiloto.certificacion !== undefined ? certificacion : actualizarPiloto.certificacion;
    actualizarPiloto.vencimiento_cma !== undefined ? vencimiento_cma : actualizarPiloto.vencimiento_cma;
    actualizarPiloto.email = email !== undefined ? email : actualizarPiloto.email;
    actualizarPiloto.contacto = contacto !== undefined ? contacto : actualizarPiloto.contacto;
    actualizarPiloto.rol = rol !== undefined ? rol : actualizarPiloto.rol;
    actualizarPiloto.deleted_At = deleted_At !== undefined ? deleted_At : actualizarPiloto.deleted_At;
    const pilotoActualizado = model.actualizarPiloto(idPiloto, actualizarPiloto);
    res.json(actualizarPiloto);
    console.log(`piloto con ID ${idPiloto} actualizado`);
    console.log(pilotoActualizado)
}