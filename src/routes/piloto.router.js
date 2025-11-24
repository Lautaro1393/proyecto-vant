import { Router } from "express"; // Desestructuro express para traer solo "ROUTER"
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = Router(); // instancio

import {  getAllPilotos, getPilotoByID, searchPiloto, crearPiloto ,borrarPiloto, modificarPiloto} from "../controllers/piloto.controllers.js";
// import { getAllPilotos } from "../services/pilotos.service.js";



//////////  GET de Tabla Pilotos ////////

//Get de toda la tabla 

router.get('/pilotos',verificarToken, getAllPilotos);

// GET - search piloto (busqueda por nombre)

router.get('/pilotos/search',verificarToken, searchPiloto);

//Metodo GET por ID

router.get('/pilotos/:id_pilotos',verificarToken, getPilotoByID);


////////// metodo POST ///////////


router.post('/pilotos',verificarToken,verificarAdmin, crearPiloto);


///// metodo put ////
router.put('/pilotos/:id', verificarToken,verificarAdmin,modificarPiloto);


// metodo delete

 router.delete('/pilotos/:id', verificarToken,verificarAdmin,borrarPiloto);


export default router; // lo exporto como Default para poder asignarle cualquier nombre si quisiera