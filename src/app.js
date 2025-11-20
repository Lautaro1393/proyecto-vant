import express from'express'
import cors from 'cors' // para solicitudes entre distintos dominios si uso el navegador
import pilotosRouter from '../src/routes/piloto.router.js' // importo el router
import dronesRouter from '../src/routes/dron.router.js'
/* import { drones } from './data/mockdata.js'; */



const app = express(); // instancio express 

//MiddleWare para usar Cors entre distintos dominios
app.use(cors());

//middleware para parsear JSON
app.use(express.json());


app.use("/api", pilotosRouter) // le digo que use ese modulo agregandole un prefijo "/api"
app.use("/api", dronesRouter)

// RAIZ
app.get('/',(req,res)=> {
    res.send(' bienvenido a la aplicacion de Vehiculos Aereos No Tripulados ')
})





//////////////////Tabla Pilotos//////////////////////Tabla Pilotos//////////////////////Tabla Pilotos///////////////////////////////////////////

//////// Rutas Delete ///////



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