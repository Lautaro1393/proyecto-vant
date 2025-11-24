import { Router } from "express"; // Desestructuro express para traer solo "ROUTER"
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router(); // instancio

import {  getAllPilotos, getPilotoByID, searchPiloto, crearPiloto ,borrarPiloto, modificarPiloto} from "../controllers/piloto.controllers.js";
// import { getAllPilotos } from "../services/pilotos.service.js";



//////////  GET de Tabla Pilotos ////////

//Get de toda la tabla 

router.get('/pilotos', getAllPilotos);

// GET - search piloto (busqueda por nombre)

router.get('/pilotos/search', searchPiloto);

//Metodo GET por ID

router.get('/pilotos/:id_pilotos', getPilotoByID);


////////// metodo POST ///////////


router.post('/pilotos', crearPiloto);


///// metodo put ////
router.put('/pilotos/:id', verificarToken,modificarPiloto);


// metodo delete

 router.delete('/pilotos/:id', verificarToken,borrarPiloto);


export default router; // lo exporto como Default para poder asignarle cualquier nombre si quisiera