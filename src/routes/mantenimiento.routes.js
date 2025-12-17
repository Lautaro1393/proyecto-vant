import { Router } from 'express';
import { listarMantenimientos, registrarMantenimiento } from '../controllers/mantenimiento.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/mantenimientos', verificarToken, listarMantenimientos);
// Solo admin puede mandar un dron al taller
router.post('/mantenimientos', verificarToken, verificarAdmin, registrarMantenimiento);

export default router;