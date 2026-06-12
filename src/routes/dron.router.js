import { Router } from "express";
// Importamos los controladores NUEVOS
import { getAllDrones, getDronById, crearDron, actualizarDron, borrarDron, handleMulterError } from "../controllers/dron.controller.js";
// Importamos los middlewares de seguridad
import { verificarToken, verificarAdmin } from "../middlewares/auth.middleware.js";
// Importamos multer
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Rutas Protegidas (cualquiera autenticado puede ver, solo Admin modifica)
router.get('/drones', verificarToken, getAllDrones);
router.get('/drones/:id', verificarToken, getDronById);

// Rutas Protegidas (Solo Admin puede modificar la flota)

// POST
router.post('/drones',
    verificarToken,
    verificarAdmin,
    upload.single('imagen'),
    handleMulterError,
    crearDron
);

router.put('/drones/:id',
    verificarToken,
    verificarAdmin,
    upload.single('imagen'),
    handleMulterError,
    actualizarDron
);

router.delete('/drones/:id',  verificarToken, verificarAdmin,
 borrarDron);

export default router;