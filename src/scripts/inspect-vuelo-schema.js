import { pool } from '../config/database.js';

async function describe(table) {
    const [rows] = await pool.query(`DESCRIBE \`${table}\``);
    return rows;
}

async function showCreate(table) {
    const [rows] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
    return Object.values(rows[0])[1];
}

async function hasColumn(table, col) {
    const [rows] = await pool.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, col]
    );
    return rows.length > 0;
}

async function main() {
    console.log('-- 1. Listado completo de tablas --');
    const [tables] = await pool.query('SHOW TABLES');
    const tnames = tables.map((r) => Object.values(r)[0]);
    console.log(tnames);
    console.log();

    for (const t of ['vuelo', 'vuelo_drones', 'vuelo_baterias', 'vuelo_pilotos']) {
        console.log(`\n== DESCRIBE ${t} ==`);
        if (!tnames.includes(t)) { console.log('NO EXISTE'); continue; }
        const cols = await describe(t);
        console.table(cols.map(c => ({
            Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key, Default: c.Default, Extra: c.Extra
        })));
        const [cnt] = await pool.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
        console.log(`Filas: ${cnt[0].n}`);
    }

    console.log('\n-- 2. Buscar horas_vuelo_acum en dron y piloto --');
    for (const t of ['dron', 'piloto']) {
        const exists = await hasColumn(t, 'horas_vuelo_acum');
        console.log(`${t}.horas_vuelo_acum: ${exists ? 'SI' : 'NO EXISTE'}`);
        if (exists) {
            const c = (await describe(t)).find(r => r.Field === 'horas_vuelo_acum');
            console.log('  ->', c);
        }
    }

    console.log('\n-- 3. SHOW CREATE TABLE vuelo (DDL exacto) --');
    if (tnames.includes('vuelo')) {
        console.log(await showCreate('vuelo'));
    } else {
        console.log('NO EXISTE');
    }

    console.log('\n-- 4. ¿Existen archivos .sql en el repo? --');
    // esto se chequea desde fuera del script (no podemos leer fs aca)
}

main()
    .catch((err) => { console.error('ERROR:', err.code || err.message); process.exitCode = 1; })
    .finally(() => pool.end());
