import express from'express'
import { pilotos } from './data/mockdata.js';
import { drones } from './data/mockdata.js';
const app = express();


// RAIZ
app.get('/',(req,res)=> {
    res.send(' bienvenido a la aplicacion de Vehiculos Aereos No Tripulados ')
})


//middleware para parsear JSON
app.use(express.json());


//////////////////Tabla Pilotos//////////////////////Tabla Pilotos//////////////////////Tabla Pilotos///////////////////////////////////////////

//////////  GET de Tabla Pilotos ////////

app.get('/pilotos',(req,res)=>{
    res.json(pilotos)
})



// GET - search piloto
app.get('/pilotos/search',(req,res)=>{
    const {nombre} = req.query;
    if(!nombre){
        return res.status(400).json({error: 'el parametro de busqueda nombre esta vacio'})
    }
    const pilotoFiltrado = pilotos.filter((piloto)=> piloto.nombre.toLowerCase().includes(nombre.toLocaleLowerCase())
);
    console.log(req.query);
    res.json(pilotoFiltrado)
})



//Metodo GET por ID
app.get('/pilotos/:id_pilotos', (req,res)=>{
    const {id_pilotos} = req.params
    const piloto = pilotos.find((item) =>  item.id_pilotos == id_pilotos);
    
    //const piloto = pilotos.find((item) => item.id_pilotos == id_pilotos);
    console.log(piloto);
    if(!piloto){
        return res.status(404).json({error: "'Piloto no encontrado"});
    }
    res.json(piloto);
});




////////// POST ////////

app.post('/pilotos',(req,res)=>{
    const { nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol, deleted_At} = req.body;
    const nuevoPiloto = {
        id_pilotos: pilotos.length +1,
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
    pilotos.push(nuevoPiloto);
    /* console.log(nuevoPiloto); */
    /* console.log(pilotos); */
    res.status(201).json(nuevoPiloto)
    
    /* console.log(req.body)
    res.json({mensaje :' usamos el metodo post para crear un producto'}); */
})


//////// Rutas PUT ///////

app.put('/pilotos/:id',(req,res)=>{
    const idPiloto = parseInt(req.params.id, 10)
    const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos === idPiloto);   // para comprar el valor y el tipo 
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
    res.json(pilotos[pilotoIndex])
    
});


//////// Rutas Delete ///////

app.delete('/pilotos/:id',(req,res)=>{
    
    const idPiloto = parseInt(req.params.id, 10)
    const pilotoIndex = pilotos.findIndex((item)=> item.id_pilotos === idPiloto);   // para comprar el valor y el tipo 
    if(pilotoIndex === -1){
        return res.status(404).json({error: 'Piloto no encontrado'});
    } 
    pilotos.splice(pilotoIndex,1); // Elimina el piloto de la lista con splice(indice y cantidad)
    return res.status(204).json({error: 'Piloto Eliminado'});
});


/////////Tabla Drones//////////////////////////////Tabla Drones///////////////////////////Tabla Drones////////////////////////////////////


// Metodo GET total

app.get('/drones',(req,res)=>{
    res.json(drones)
})


// GET - search dron
app.get('/drones/search',(req,res)=>{
    const {matricula} = req.query;
    if(!matricula){
        return res.status(400).json({error: 'el parametro de busqueda - matricula - esta vacio'})
    }
    const dronFiltrado = drones.filter((dron)=> dron.matricula.toLowerCase().includes(matricula.toLocaleLowerCase())
);
    console.log(req.query);
    res.json(dronFiltrado)
})




//Metodo GET por ID
app.get('/drones/:id_dron', (req,res)=>{
    const {id_dron} = req.params
    const dron = drones.find((item) =>  item.id_dron == id_dron);
    console.log(dron);
    if(!dron){
        return res.status(404).json({error: "'Dron no encontrado"});
    }
    res.json(dron);
});



// metodo  POST

app.post('/drones',(req,res)=>{
    const { matricula, numero_de_serie, fecha_adquisicion, estado, fecha_mantenimiento, observaciones, imagen, modelo_dron_id, deleted_At, piloto_id } = req.body
    const nuevoDron ={
        id_dron: drones.length +1,
        matricula,
        numero_de_serie,
        fecha_adquisicion,
        estado,
        fecha_mantenimiento,
        observaciones,
        imagen,
        modelo_dron_id,
        deleted_At
    };
    drones.push(nuevoDron);
    /* console.log(req.body); */
   res.status(201).json(nuevoDron);
}) 
// METODO PUT


app.put('/drones/:id',(req,res)=>{
    const idDrones = parseInt(req.params.id, 10)
    const dronIndex = drones.findIndex((item)=> item.id_dron === idDrones);   // para comprar el valor y el tipo 
    if(dronIndex === -1){
        return res.status(404).json({error: 'Dron no encontrado'});
    } 
    const { matricula, numero_de_serie, fecha_adquisicion,estado, fecha_mantenimiento,observaciones, imagen,modelo_dron_id, deleted_at, piloto_id} = req.body // obteniendo los datos del body 
    const dronActualizado ={
        id_dron : idDrones,
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
    res.json(drones[dronIndex])
    
});


//////// Rutas Delete ///////

app.delete('/drones/:id',(req,res)=>{

const idDrones = parseInt(req.params.id, 10)
    const dronIndex = drones.findIndex((item)=> item.id_dron === idDrones);   // para comprar el valor y el tipo 
    if(dronIndex === -1){
        return res.status(404).json({error: 'Dron no encontrado'});
} 
 drones.splice(dronIndex,1); // Elimina el piloto de la lista con splice(indice y cantidad)
 return res.status(204).json({error: 'Dron Eliminado'});
});



app.use((req,res,next)=>{
    res.status(404).json({error:'Ruta no encontrada'})
});


/////////// crearcion del servidor /////////// crearcion del servidor/////////// 


const PORT = 3000

app.listen(PORT,()=>{
    console.log(`               ---- server corriendo en http://localhost:${PORT} ----` )
});