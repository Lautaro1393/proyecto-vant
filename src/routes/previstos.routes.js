import { Router } from 'express';
import { listarPrevistos, crearPrevisto, getPrevistoById, borrarPrevisto, actualizarPrevisto } from '../controllers/previstos.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/previstos', verificarToken, listarPrevistos);
router.get('/previstos/:id', verificarToken, getPrevistoById);
router.post('/previstos', verificarToken, crearPrevisto);
router.put('/previstos/:id', verificarToken, verificarAdmin, actualizarPrevisto);
router.delete('/previstos/:id', verificarToken, verificarAdmin, borrarPrevisto);

export default router;