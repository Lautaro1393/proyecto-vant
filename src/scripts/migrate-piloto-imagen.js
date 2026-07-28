import { pool } from '../config/database.js';

const hasColumn = async (table, column) => {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return rows.length > 0;
};

const migrations = [
    {
        check: async () => !(await hasColumn('piloto', 'imagen')),
        sql: `ALTER TABLE piloto ADD COLUMN imagen VARCHAR(120) NULL`,
        label: 'piloto.imagen',
    },
];

const run = async () => {
    let applied = 0;
    for (const m of migrations) {
        const needs = await m.check();
        if (needs) {
            console.log(`[migrate-piloto-imagen] Aplicando: ${m.label}`);
            await pool.query(m.sql);
            applied++;
        } else {
            console.log(`[migrate-piloto-imagen] Ya existe:  ${m.label} (skip)`);
        }
    }
    console.log(`[migrate-piloto-imagen] Listo. ${applied} ALTERs aplicados.`);
    await pool.end();
};

run().catch((e) => { console.error(e); process.exit(1); });
