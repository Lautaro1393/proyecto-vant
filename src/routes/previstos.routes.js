import { Router } from 'express';
import { listarPrevistos, crearPrevisto } from '../controllers/previstos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas (Protegidas con Token)
router.get('/previstos', verificarToken, listarPrevistos);
router.post('/previstos', verificarToken, crearPrevisto);

export default router;