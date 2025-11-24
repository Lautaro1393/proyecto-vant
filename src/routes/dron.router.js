import { Router } from "express";
// Importamos los controladores NUEVOS
import { getAllDrones, getDronById, crearDron, actualizarDron, borrarDron } from "../controllers/dron.controller.js";
// Importamos los middlewares de seguridad
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas Públicas (Cualquiera puede ver, o puedes ponerle verificarToken si quieres que sea privado)
router.get('/drones', getAllDrones);
router.get('/drones/:id', getDronById);

// Rutas Protegidas (Solo Admin puede modificar la flota)
router.post('/drones', verificarToken, verificarAdmin, crearDron);

router.put('/drones/:id',  verificarToken, verificarAdmin,
 actualizarDron);

router.delete('/drones/:id',  verificarToken, verificarAdmin,
 borrarDron);

export default router;