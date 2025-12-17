import express from'express'
import cors from 'cors' // para solicitudes entre distintos dominios si uso el navegador
import pilotosRouter from '../src/routes/piloto.router.js' // importo el router
import dronesRouter from '../src/routes/dron.router.js'
import authRouter from '../src/routes/auth.routes.js'
import modeloRouter from '../src/routes/modelo_dron.routes.js'
import bateriaRouter from '../src/routes/bateria.routes.js'
import mantenimientoRouter from '../src/routes/mantenimiento.routes.js'
import previstosRouter from '../src/routes/previstos.routes.js'



const app = express(); // instancio express 

//MiddleWare para usar Cors entre distintos dominios
app.use(cors());

//middleware para parsear JSON
app.use(express.json());

app.use("/auth", authRouter)
app.use("/api", pilotosRouter) // le digo que use ese modulo agregandole un prefijo "/api"
app.use("/api", dronesRouter)
app.use("/api", modeloRouter)
app.use("/api", bateriaRouter)
app.use("/api", mantenimientoRouter )
app.use("/api", previstosRouter)


// RAIZ de la aplicacion
app.get('/',(req,res)=> {
    res.send(' bienvenido a la aplicacion de Vehiculos Aereos No Tripulados ')
})

app.use((req,res,next)=>{
    res.status(404).json({error:'Ruta no encontrada'})
});

/////////// creacion del servidor /////////// crearcion del servidor/////////// 




// Si Railway me da un puerto, uso ese. Si no (estoy en mi PC), uso el 3000.
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`---- Server corriendo en http://localhost:${PORT} ----`);
});

// const PORT = 3000

// app.listen(PORT,()=>{
//     console.log(`               ---- server corriendo en http://localhost:${PORT} ----` )
// });