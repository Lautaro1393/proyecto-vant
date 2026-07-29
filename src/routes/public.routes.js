import { Router } from 'express';
import { getLandingData } from '../controllers/public.controller.js';

// Router publico (sin auth) para la landing page.
// Solo expone datos no sensibles (stats agregados, top drones, top pilotos).
// Montado en /api/public desde app.js.
const router = Router();

router.get('/landing', getLandingData);

export default router;
