import express from'express'
import cors from 'cors' // para solicitudes entre distintos dominios si uso el navegador
import { drones } from './data/mockdata.js';
const app = express();
import pilotosRouter from '../src/routes/piloto.router.js' // importo el router
app.use("/api", pilotosRouter) // le digo que use ese modulo agregandole un prefijo "/api"
import dronesRouter from '../src/routes/dron.router.js'
app.use("/api", dronesRouter)

// RAIZ
app.get('/',(req,res)=> {
    res.send(' bienvenido a la aplicacion de Vehiculos Aereos No Tripulados ')
})




//MiddleWare para usar Cors entre distintos dominios
app.use(cors());

//middleware para parsear JSON
app.use(express.json());


//////////////////Tabla Pilotos//////////////////////Tabla Pilotos//////////////////////Tabla Pilotos///////////////////////////////////////////



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