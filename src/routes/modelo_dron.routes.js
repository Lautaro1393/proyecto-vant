import { Router } from 'express';
import { listarModelos, crearModelo, actualizarModelo, borrarModelo } from '../controllers/modelo_dron.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/modelos', verificarToken, listarModelos);
router.post('/modelos', verificarToken, verificarAdmin, crearModelo);
router.put('/modelos/:id', verificarToken, verificarAdmin, actualizarModelo);
router.delete('/modelos/:id', verificarToken, verificarAdmin, borrarModelo);

export default router;