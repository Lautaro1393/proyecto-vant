import { Router } from 'express';
import { listarVuelos, crearVuelo, getVueloById, borrarVuelo, actualizarVuelo } from '../controllers/vuelo.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/vuelos', verificarToken, listarVuelos);
router.get('/vuelos/:id', verificarToken, getVueloById);
router.post('/vuelos', verificarToken, crearVuelo);
router.put('/vuelos/:id', verificarToken, verificarAdmin, actualizarVuelo);
router.delete('/vuelos/:id', verificarToken, verificarAdmin, borrarVuelo);

export default router;
