import { Router } from "express"; // Desestructuro express para traer solo "ROUTER"
import { dronSearch, dronPorId, getAllDrones, actualizarDron, borrarDron, crearDron } from "../controllers/dron.controller.js";

const router = Router(); // instancio


// ## 🚁 Drones 


// Metodo GET total

router.get('/drones', getAllDrones)

// GET - search dron
router.get('/drones/search', dronSearch)

//Metodo GET por ID
router.get('/drones/:id_dron', dronPorId);

/// RUTA POST

router.post('/drones', crearDron)

// RUTA PUT


router.put('/drones/:id', actualizarDron);


//////// Rutas Delete ///////

router.delete('/drones/:id', borrarDron);



export default router; // lo exporto como Default para poder asignarle cualquier nombre si quisiera