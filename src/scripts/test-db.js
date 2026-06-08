import { pool } from '../config/database.js';

const SENSITIVE_HINTS = ['password', 'pass', 'secret', 'token', 'hash'];

const isSensitive = (col) =>
    SENSITIVE_HINTS.some((h) => col.toLowerCase().includes(h));

const pad = (str, len) => String(str ?? 'NULL').padEnd(len).slice(0, len);

async function main() {
    console.log('-- Test de conexion --');
    const [ping] = await pool.query('SELECT 1 AS ok');
    console.log('Conectado:', ping[0].ok === 1 ? 'SI' : 'NO');
    console.log();

    console.log('-- Tablas en la base --');
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map((r) => Object.values(r)[0]);
    console.log(tableNames);
    console.log();

    for (const table of tableNames) {
        console.log(`\n== ${table} (LIMIT 5) ==`);

        const [cols] = await pool.query(
            `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [table]
        );
        const sensitiveCols = cols.filter((c) => isSensitive(c.COLUMN_NAME));
        const headers = cols.map((c) =>
            isSensitive(c.COLUMN_NAME) ? `${c.COLUMN_NAME}*` : c.COLUMN_NAME
        );
        const widths = headers.map((h) => Math.max(h.length, 10));

        console.log(headers.map((h, i) => pad(h, widths[i])).join(' | '));
        console.log(widths.map((w) => '-'.repeat(w)).join('-+-'));

        const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT 5`);
        if (rows.length === 0) {
            console.log('(tabla vacia)');
            continue;
        }

        for (const row of rows) {
            const line = cols.map((c, i) => {
                let v = row[c.COLUMN_NAME];
                if (sensitiveCols.find((s) => s.COLUMN_NAME === c.COLUMN_NAME) && v != null) {
                    v = '***';
                }
                return pad(v, widths[i]);
            });
            console.log(line.join(' | '));
        }
    }

    console.log('\n-- Conteo por tabla --');
    const [counts] = await pool.query(
        `SELECT table_name, table_rows
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
         ORDER BY table_rows DESC`
    );
    console.table(counts);
}

main()
    .catch((err) => {
        console.error('ERROR:', err.code || err.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
