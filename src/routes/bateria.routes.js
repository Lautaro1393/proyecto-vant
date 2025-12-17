import {Router} from 'express';
import {getAllBaterias, crearBateria} from '../controllers/bateria.controller.js'
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// RUTAS
router.get('/baterias', verificarToken, getAllBaterias);
router.post('/baterias', verificarToken, verificarAdmin, crearBateria);

export default router;