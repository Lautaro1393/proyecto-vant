// import { getAllPilotos } from "../services/pilotos.service.js"; 
import * as service from '../services/pilotos.service.js'

///////////////////////  METODO GET  ////////////////////////////////


//Trae toda la tabla 

export const getAllPilotos = (req, res) => {
    res.json(service.getAllPilotos());
    console.log(service.getAllPilotos())
}
//SEARCH  busqueda por nombre del piloto/////////////////

export const searchPiloto = (req,res)=>{
    const {nombre} = req.query;
    if(!nombre){
        return res.status(400).json({error: 'el parametro de busqueda nombre esta vacio'})
    }
    const pilotos = service.getAllPilotos();
    const pilotoFiltrado = pilotos.filter((piloto)=> piloto.nombre.toLowerCase().includes(nombre.toLocaleLowerCase())
);
console.log(req.query);
res.json(pilotoFiltrado)
};


//GET por ID del piloto//////////////////

export const getPilotoByID = (req,res)=>{
    const {id_pilotos} = req.params
    // const piloto = pilotos.find((item) =>  item.id_pilotos == id_pilotos);
    const piloto = service.getPilotoByID(id_pilotos);
    
    console.log(piloto);
    if(!piloto){
        console.log('Error 404: Piloto no encotrado')
        return res.status(404).json({error: "'Piloto no encontrado"});
        
    }
    res.json(piloto);
};

////////////////////////////////// Metodo post ///////////////
  
export const crearPiloto = (req,res)=>{
    const pilotos = service.getAllPilotos();
    console.log(pilotos)
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At} = req.body;
if (!nombre || !apellido || !certificacion || !email || !rol) {
    return res.status(400).json({Error: 'Faltan datos en el body' })   
}
else{

    const nuevoPiloto = service.crearPiloto(nombre,apellido,dni,certificacion,vencimiento_cma,email,contacto,rol,deleted_At);
    pilotos.push(nuevoPiloto);
    console.log(nuevoPiloto)
    console.log(pilotos);
    res.status(201).json(nuevoPiloto)
    
}
};

// metodo PUT

export const modificarPiloto=(req,res)=>{
    const pilotos = service.getAllPilotos();
    const idPiloto = parseInt(req.params.id, 10);
    // const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos == idPiloto);   
    const pilotoIndex = service.actualizarPiloto(idPiloto);
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



// metodo delete  ///////////

export const borrarPiloto = (req,res)=>{
    
    const idPiloto = parseInt(req.params.id, 10) // obtengo el id del piloto y lo convierto en un entero de base 10
    console.log(idPiloto)
    // const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos === idPiloto);   // para comprar el valor y el tipo 
    const pilotoBorrado = service.borrarPiloto(idPiloto)
    console.log(pilotoBorrado)
    if(pilotoBorrado === -1){
        return res.status(404).json({error: 'Piloto no encontrado'});
    } 
    console.log('piloto eliminado mediante DELETE', pilotoBorrado);
    return res.status(204).json({mensaje: 'Piloto Eliminado mediante DELETE',
        productoEliminado: pilotoBorrado
    });
};
