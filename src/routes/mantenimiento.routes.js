import { Router } from 'express';
import { listarMantenimientos, getMantenimientoById, registrarMantenimiento, actualizarMantenimiento, borrarMantenimiento } from '../controllers/mantenimiento.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/mantenimientos', verificarToken, listarMantenimientos);
router.get('/mantenimientos/:id', verificarToken, getMantenimientoById);
router.post('/mantenimientos', verificarToken, verificarAdmin, registrarMantenimiento);
router.put('/mantenimientos/:id', verificarToken, verificarAdmin, actualizarMantenimiento);
router.delete('/mantenimientos/:id', verificarToken, verificarAdmin, borrarMantenimiento);

export default router;