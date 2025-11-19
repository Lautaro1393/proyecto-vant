import { Router } from "express"; // Desestructuro express para traer solo "ROUTER"

const router = Router(); // instancio

import { getAllPilotos, getPilotoByID, searchPiloto } from "../controllers/piloto.controllers.js";




//////////  GET de Tabla Pilotos ////////

//Get de toda la tabla 

router.get('/pilotos', getAllPilotos);

// GET - search piloto (busqueda por nombre)

router.get('/pilotos/search', searchPiloto);

//Metodo GET por ID

router.get('/pilotos/:id_pilotos', getPilotoByID);

export default router; // lo exporto como Default para poder asignarle cualquier nombre si quisiera