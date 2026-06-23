import { createPool } from 'mysql2/promise';
import 'dotenv/config';

export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

pool.on('connection', (conn) => {
    conn.on('error', (err) => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            console.warn('[db] Conexion perdida, el pool reintentara en la proxima query');
        } else {
            console.error('[db] Error de conexion:', err.code, err.message);
        }
    });
});