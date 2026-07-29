import * as model from '../models/public.model.js';

// GET /api/public/landing
// Devuelve los datos para la landing page: stats + top drones + top pilotos.
// NO requiere autenticacion. Solo expone datos publicos (sin emails, contactos, etc).
export const getLandingData = async (req, res) => {
    try {
        const [stats, top_drones, top_pilotos] = await Promise.all([
            model.getStats(),
            model.getTopDrones(3),
            model.getTopPilotos(3),
        ]);
        res.json({ stats, top_drones, top_pilotos });
    } catch (error) {
        console.error('[public/landing] error:', error.message);
        res.status(500).json({ error: 'No se pudieron cargar los datos de la landing' });
    }
};
