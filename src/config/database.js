import { createPool } from 'mysql2/promise';
import 'dotenv/config';

export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

pool.on('connection', (conn) => {
    conn.on('error', (err) => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            console.warn('[db] Conexion perdida, se descarta y se reemplaza en la proxima query');
        } else {
            console.error('[db] Error de conexion:', err.code, err.message);
        }
    });
});

const CONNECTION_LOST_CODES = new Set([
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
    'ER_CONNECTION_LOST',
]);

function esErrorDeConexion(err) {
    return err && (CONNECTION_LOST_CODES.has(err.code) || (err.code === 4031 || String(err.code).includes('4031')));
}

async function reintentarSiConexionPerdida(fn) {
    try {
        return await fn();
    } catch (err) {
        if (esErrorDeConexion(err)) {
            console.warn('[db] Reintentando query tras error de conexion:', err.code || err.message);
            return await fn();
        }
        throw err;
    }
}

const queryOriginal = pool.query.bind(pool);
const executeOriginal = pool.execute.bind(pool);

pool.query = (...args) => reintentarSiConexionPerdida(() => queryOriginal(...args));
pool.execute = (...args) => reintentarSiConexionPerdida(() => executeOriginal(...args));