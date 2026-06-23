import process from 'node:process';
process.env.TZ = 'UTC';

import express from'express'
import cors from 'cors' // para solicitudes entre distintos dominios si uso el navegador
import pilotosRouter from '../src/routes/piloto.router.js' // importo el router
import dronesRouter from '../src/routes/dron.router.js'
import authRouter from '../src/routes/auth.routes.js'
import modeloRouter from '../src/routes/modelo_dron.routes.js'
import bateriaRouter from '../src/routes/bateria.routes.js'
import mantenimientoRouter from '../src/routes/mantenimiento.routes.js'
import previstosRouter from '../src/routes/previstos.routes.js'
import vuelosRouter from '../src/routes/vuelo.routes.js'



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
app.use("/api", vuelosRouter)

// Frontend estatico (Tactical UAV Fleet Manager) — solo si la carpeta existe
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(__dirname, "..", "frontend");
if (existsSync(frontendDir)) {
  app.use("/styles", express.static(join(frontendDir, "styles"), {
    setHeaders: (res) => res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"),
  }));
  app.use("/scripts", express.static(join(frontendDir, "scripts"), {
    setHeaders: (res) => res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"),
  }));
  app.use("/assets", express.static(join(frontendDir, "assets"), {
    setHeaders: (res) => res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"),
  }));
  const indexHandler = (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(join(frontendDir, "index.html"));
  };
  app.get("/", indexHandler);
  app.get(/^\/(?!api|auth|uploads|styles|scripts|assets).*/, indexHandler);
}

// uploads (imagenes de drones)
const uploadsDir = join(__dirname, "..", "uploads");
if (existsSync(uploadsDir)) {
  app.use("/uploads", express.static(uploadsDir));
}


// RAIZ de la aplicacion — manejada por el bloque frontend arriba (sendFile index.html).

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