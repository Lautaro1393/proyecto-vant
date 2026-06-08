import { pool } from '../config/database.js';
import { formatFecha } from '../helpers/dateHelper.js';

const CLIMAS_VALIDOS = ['Despejado','Parcialmente Nublado','Nublado','Lluvia Ligera','Lluvia Fuerte','Viento Fuerte','Niebla'];

export const TIEMPO_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

export const tiempoAMinutos = (tiempo) => {
    if (!tiempo || !TIEMPO_REGEX.test(tiempo)) return null;
    const [h, m, s] = tiempo.split(':').map(Number);
    return Math.round((h * 3600 + m * 60 + s) / 60 * 100) / 100;
};

export const getAllVuelos = async () => {
    const query = `
        SELECT v.*,
               (SELECT GROUP_CONCAT(d.dron_id)
                  FROM vuelo_drones d WHERE d.vuelo_id = v.id_vuelo) AS drones_ids,
               (SELECT GROUP_CONCAT(b.bateria_id)
                  FROM vuelo_baterias b WHERE b.vuelo_id = v.id_vuelo) AS baterias_ids,
               (SELECT GROUP_CONCAT(p.piloto_id)
                  FROM vuelo_pilotos p WHERE p.vuelo_id = v.id_vuelo) AS pilotos_ids
        FROM vuelo v
        WHERE v.deleted_at IS NULL
        ORDER BY v.fecha DESC, v.id_vuelo DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

export const getVueloById = async (id) => {
    const [vueloRows] = await pool.query(
        'SELECT * FROM vuelo WHERE id_vuelo = ? AND deleted_at IS NULL',
        [id]
    );
    const vuelo = vueloRows[0];
    if (!vuelo) return null;

    const [drones] = await pool.query(
        `SELECT d.id_dron, d.matricula, d.numero_de_serie
         FROM vuelo_drones vd
         JOIN dron d ON d.id_dron = vd.dron_id
         WHERE vd.vuelo_id = ?`,
        [id]
    );
    const [baterias] = await pool.query(
        `SELECT b.id_bateria, b.numero_de_serie, b.estado
         FROM vuelo_baterias vb
         JOIN bateria b ON b.id_bateria = vb.bateria_id
         WHERE vb.vuelo_id = ?`,
        [id]
    );
    const [pilotos] = await pool.query(
        `SELECT p.id_pilotos, p.nombre, p.apellido
         FROM vuelo_pilotos vp
         JOIN piloto p ON p.id_pilotos = vp.piloto_id
         WHERE vp.vuelo_id = ?`,
        [id]
    );

    return { ...vuelo, drones, baterias, pilotos };
};

export const crearVuelo = async (data, conn) => {
    const { fecha, coordenadas, tiempo_de_vuelo, proposito, clima, observaciones, previsto_id, estado } = data;
    const runner = conn || pool;
    const [result] = await runner.query(
        `INSERT INTO vuelo (fecha, coordenadas, tiempo_de_vuelo, proposito, clima, observaciones, previsto_id, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            formatFecha(fecha),
            coordenadas,
            tiempo_de_vuelo,
            proposito,
            clima,
            observaciones || null,
            previsto_id || null,
            estado || 'Realizado'
        ]
    );
    return result.insertId;
};

export const asociarDrones = async (id_vuelo, ids, conn) => {
    if (!ids || ids.length === 0) return;
    const runner = conn || pool;
    const values = ids.map((id_dron) => [id_vuelo, id_dron]);
    await runner.query(
        'INSERT INTO vuelo_drones (vuelo_id, dron_id) VALUES ?',
        [values]
    );
};

export const asociarBaterias = async (id_vuelo, ids, conn) => {
    if (!ids || ids.length === 0) return;
    const runner = conn || pool;
    const values = ids.map((id_bateria) => [id_vuelo, id_bateria]);
    await runner.query(
        'INSERT INTO vuelo_baterias (vuelo_id, bateria_id) VALUES ?',
        [values]
    );
};

export const asociarPilotos = async (id_vuelo, ids, conn) => {
    if (!ids || ids.length === 0) return;
    const runner = conn || pool;
    const values = ids.map((id_piloto) => [id_vuelo, id_piloto]);
    await runner.query(
        'INSERT INTO vuelo_pilotos (vuelo_id, piloto_id) VALUES ?',
        [values]
    );
};

export const incrementarCiclosBateria = async (id_bateria, conn) => {
    const runner = conn || pool;
    await runner.query(
        'UPDATE bateria SET ciclos_de_carga = ciclos_de_carga + 1 WHERE id_bateria = ?',
        [id_bateria]
    );
};

export const sumarHorasDron = async (id_dron, minutos, conn) => {
    const runner = conn || pool;
    await runner.query(
        'UPDATE dron SET horas_vuelo_acum = horas_vuelo_acum + ? WHERE id_dron = ?',
        [minutos, id_dron]
    );
};

export const sumarHorasPiloto = async (id_piloto, minutos, conn) => {
    const runner = conn || pool;
    await runner.query(
        'UPDATE piloto SET horas_vuelo_acum = horas_vuelo_acum + ? WHERE id_pilotos = ?',
        [minutos, id_piloto]
    );
};

export const modificarVuelo = async (id, data, conn) => {
    const { fecha, coordenadas, tiempo_de_vuelo, proposito, clima, observaciones, previsto_id, estado } = data;
    const runner = conn || pool;
    const [result] = await runner.query(
        `UPDATE vuelo
         SET fecha = ?, coordenadas = ?, tiempo_de_vuelo = ?, proposito = ?,
             clima = ?, observaciones = ?, previsto_id = ?, estado = ?
         WHERE id_vuelo = ? AND deleted_at IS NULL`,
        [
            formatFecha(fecha), coordenadas, tiempo_de_vuelo, proposito,
            clima, observaciones || null, previsto_id || null, estado || 'Realizado',
            id
        ]
    );
    return result;
};

export const reemplazarPivotes = async (id_vuelo, drones, baterias, pilotos, conn) => {
    const runner = conn || pool;
    await runner.query('DELETE FROM vuelo_drones WHERE vuelo_id = ?', [id_vuelo]);
    await runner.query('DELETE FROM vuelo_baterias WHERE vuelo_id = ?', [id_vuelo]);
    await runner.query('DELETE FROM vuelo_pilotos WHERE vuelo_id = ?', [id_vuelo]);
    await asociarDrones(id_vuelo, drones, runner);
    await asociarBaterias(id_vuelo, baterias, runner);
    await asociarPilotos(id_vuelo, pilotos, runner);
};

export const deleteVuelo = async (id) => {
    const [result] = await pool.query(
        'UPDATE vuelo SET deleted_at = NOW() WHERE id_vuelo = ? AND deleted_at IS NULL',
        [id]
    );
    return result;
};

export { CLIMAS_VALIDOS };
