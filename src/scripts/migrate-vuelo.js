import { pool } from '../config/database.js';

const STATEMENTS = [
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vuelo' AND COLUMN_NAME = 'observaciones'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE vuelo ADD COLUMN observaciones TEXT NULL AFTER clima`,
        label: 'vuelo.observaciones',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vuelo' AND COLUMN_NAME = 'previsto_id'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE vuelo ADD COLUMN previsto_id INT NULL AFTER observaciones`,
        label: 'vuelo.previsto_id',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vuelo' AND COLUMN_NAME = 'estado'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE vuelo ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'Realizado' AFTER previsto_id`,
        label: 'vuelo.estado',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vuelo' AND COLUMN_NAME = 'created_at'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE vuelo ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER estado`,
        label: 'vuelo.created_at',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dron' AND COLUMN_NAME = 'horas_vuelo_acum'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE dron ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0`,
        label: 'dron.horas_vuelo_acum',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piloto' AND COLUMN_NAME = 'horas_vuelo_acum'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE piloto ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0`,
        label: 'piloto.horas_vuelo_acum',
    },
    {
        check: async () => {
            const [r] = await pool.query(
                `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vuelo' AND INDEX_NAME = 'fk_vuelo_previsto'`
            );
            return r.length > 0;
        },
        sql: `ALTER TABLE vuelo ADD CONSTRAINT fk_vuelo_previsto
              FOREIGN KEY (previsto_id) REFERENCES previstos(id_previstos)
              ON DELETE SET NULL ON UPDATE CASCADE`,
        label: 'FK vuelo.previsto_id -> previstos.id_previstos',
    },
];

async function run() {
    console.log('-- Migracion: Modulo Vuelos (Etapa 2) --\n');
    let applied = 0, skipped = 0;

    for (const stmt of STATEMENTS) {
        const exists = await stmt.check();
        if (exists) {
            console.log(`[SKIP] ${stmt.label} (ya existe)`);
            skipped++;
            continue;
        }
        console.log(`[APPLY] ${stmt.label}`);
        console.log(`        SQL: ${stmt.sql}`);
        await pool.query(stmt.sql);
        applied++;
    }

    console.log(`\n-- Resumen: ${applied} aplicados, ${skipped} omitidos --`);
}

run()
    .catch((err) => {
        console.error('\nERROR:', err.code || '', err.sqlMessage || err.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
