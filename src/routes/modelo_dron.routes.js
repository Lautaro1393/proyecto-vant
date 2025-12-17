import { Router } from 'express';
import { listarModelos, crearModelo } from '../controllers/modelo_dron.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas
router.get('/modelos', verificarToken, listarModelos); // Cualquiera logueado puede verlos
router.post('/modelos', verificarToken, verificarAdmin, crearModelo); // Solo admin crea

export default router;