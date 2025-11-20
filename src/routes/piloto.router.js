import { Router } from "express"; // Desestructuro express para traer solo "ROUTER"

const router = Router(); // instancio

import { borrarPiloto, crearPiloto, getAllPilotos, getPilotoByID, modificarPiloto, searchPiloto } from "../controllers/piloto.controllers.js";




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
router.put('/pilotos/:id', modificarPiloto);


// metodo delete

router.delete('/pilotos/:id', borrarPiloto);


export default router; // lo exporto como Default para poder asignarle cualquier nombre si quisiera