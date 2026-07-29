import { pool } from '../config/database.js';

// Stats globales para la landing page.
// Un solo query con 4 sub-SELECTs para minimizar round-trips.
// `horas_vuelo_acum` en `dron` y `piloto` esta en MINUTOS (no horas).
export const getStats = async () => {
    const [rows] = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM dron) AS total_drones,
            (SELECT COUNT(*) FROM piloto WHERE deleted_at IS NULL) AS total_pilotos,
            (SELECT COUNT(*) FROM vuelo WHERE deleted_at IS NULL) AS total_vuelos,
            (SELECT COALESCE(SUM(horas_vuelo_acum), 0) FROM dron) AS total_horas_min
    `);
    return rows[0];
};

// Top N drones por horas de vuelo (desc).
// Devuelve solo columnas seguras para mostrar en una landing publica
// (sin email, contacto, ni cualquier dato sensible).
// La relacion vuelo <-> dron es via la tabla pivote `vuelo_drones`.
export const getTopDrones = async (limit = 3) => {
    const [rows] = await pool.query(`
        SELECT d.id_dron, d.matricula, d.estado, d.horas_vuelo_acum, d.imagen,
               m.modelo AS nombre_modelo, m.fabricante,
               (SELECT COUNT(DISTINCT vd.vuelo_id)
                  FROM vuelo_drones vd
                  JOIN vuelo v ON v.id_vuelo = vd.vuelo_id
                  WHERE vd.dron_id = d.id_dron AND v.deleted_at IS NULL
               ) AS vuelos_count
        FROM dron d
        LEFT JOIN modelo_dron m ON d.id_modelo_dron = m.id_modelo_dron
        WHERE d.horas_vuelo_acum > 0
        ORDER BY d.horas_vuelo_acum DESC
        LIMIT ?
    `, [limit]);
    return rows;
};

// Top N pilotos por horas de vuelo (desc).
// Reuso el patron de `pilotos.model.js` con `vuelos_count` agregado.
export const getTopPilotos = async (limit = 3) => {
    const [rows] = await pool.query(`
        SELECT p.id_pilotos, p.nombre, p.apellido, p.dni,
               p.certificacion, p.vencimiento_cma, p.horas_vuelo_acum, p.imagen,
               (SELECT COUNT(DISTINCT vp.vuelo_id)
                  FROM vuelo_pilotos vp
                  JOIN vuelo v ON v.id_vuelo = vp.vuelo_id
                  WHERE vp.piloto_id = p.id_pilotos AND v.deleted_at IS NULL
               ) AS vuelos_count
        FROM piloto p
        WHERE p.deleted_at IS NULL AND p.horas_vuelo_acum > 0
        ORDER BY p.horas_vuelo_acum DESC
        LIMIT ?
    `, [limit]);
    return rows;
};
