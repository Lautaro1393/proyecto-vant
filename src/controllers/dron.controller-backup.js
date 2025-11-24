import * as service from '../services/dron.service.js'
//metodos http

// GET de toda la tabla

export const getAllDrones = (req,res)=>{
    res.json(service.getAllDrones());
    console.log(service.getAllDrones())
}
/////// Search por matricula ////////////////

export const searchDron =(req,res)=>{
    const {matricula} = req.query;
    if(!matricula){
        return res.status(400).json({error: 'el parametro de busqueda - matricula - esta vacio'})
    }
    const drones = service.getAllDrones();
    const dronFiltrado = drones.filter((dron)=> dron.matricula.toLowerCase().includes(matricula.toLocaleLowerCase())
);
    console.log(req.query);
    res.json(dronFiltrado)
}
//////////// Get Por ID /////////////


export const dronPorId  =   (req,res)=>{
    const {id_dron} = req.params
    const dron = service.getDronByID(id_dron);
    // const dron = drones.find((item) =>  item.id_dron == id_dron);
    console.log(dron);
    if(!dron){
        return res.status(404).json({error: "'Dron no encontrado"});
    }
    res.json(dron);
}




// Crear Dron  //


 export const crearDron = (req,res)=>{
    const drones = service.getAllDrones();
    const { matricula, numero_de_serie, fecha_adquisicion, estado, fecha_mantenimiento, observaciones, imagen, modelo_dron_id, deleted_At, piloto_id } = req.body;
    if (!matricula || !numero_de_serie) {
      return res.status(400).json({error: 'Faltan datos en el body para crear el registro'})
    }
    else{
      const nuevoDron = service.crearDron(
        matricula,
        numero_de_serie,
        fecha_adquisicion,
        estado,
        fecha_mantenimiento,
        observaciones,
        imagen,
        modelo_dron_id,
        deleted_At,
        piloto_id)
      ;
      drones.push(nuevoDron);
      /* console.log(req.body); */
      res.status(201).json(nuevoDron);
    }
    };
    
    
//// modificar Dron por metodo put /////

export const actualizarDron = (req,res)=>{
    const drones = service.getAllDrones();
    const idDron = parseInt(req.params.id, 10)
    const dronIndex = service.actualizarDron(idDron);
    // const dronIndex = drones.findIndex((item)=> item.id_dron === idDron);   // para comprar el valor y el tipo 
    if(dronIndex === -1){
        return res.status(404).json({error: 'Dron no encontrado'});
    } 
    const { matricula, numero_de_serie, fecha_adquisicion,estado, fecha_mantenimiento,observaciones, imagen,modelo_dron_id, deleted_at, piloto_id} = req.body // obteniendo los datos del body 
    const dronActualizado ={
        id_dron : idDron,
        matricula,
        numero_de_serie,
        fecha_adquisicion,
        estado,
        fecha_mantenimiento,
        observaciones,
        imagen,
        modelo_dron_id,
        deleted_at,
        piloto_id
    };
    drones[dronIndex]= dronActualizado;
    console.log('El dron se actualizo correctamente', dronActualizado)
    res.json(drones[dronIndex])
    
}

// METODO DELETE

export const borrarDron = (req,res)=>{
const idDron = parseInt(req.params.id, 10)
const dronBorrado = service.borrarDron(idDron);
console.log(dronBorrado)
    // const dronIndex = drones.findIndex((item)=> item.id_dron === idDron);   // para comprar el valor y el tipo 
    if(dronBorrado === -1){
        return res.status(404).json({error: 'Dron no encontrado'});
} 
console.log('dron borrado correctamente', dronBorrado)
//  drones.splice(dronIndex,1); // Elimina el piloto de la lista con splice(indice y cantidad)
return res.status(204).json({error: 'Dron Eliminado'});
}
