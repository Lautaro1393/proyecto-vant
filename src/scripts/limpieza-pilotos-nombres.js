// Limpia los nombres de pilotos que quedaron de seeds/pruebas para que
// la base de datos presente datos profesionales. Idempotente: solo
// actualiza si el nombre/apellido/DNI actual coincide con el "sucio".
//
// Cambios:
//   - Nombres con typos: Gomezzzzzzzzzzzz, Valentinaaaaaaa, Prueba Seguridad, Piloto Prueba
//   - DNIs con longitud != 8 digitos (Argentina usa 8)
//   - DNIs duplicados entre pilotos

import { pool } from '../config/database.js';

const CHANGES = [
    // { id, nombre, apellido, dni }
    { id: 3,  nombre: 'Mateo',      apellido: 'Gomez',   dni: '95284600' },  // 9528460 (7d) -> 95284600
    { id: 10, nombre: 'Valentina',  apellido: 'Gomez',   dni: '42721493' },  // ya estaba bien
    { id: 16, nombre: 'Admin',      apellido: 'Sistema', dni: '99887766' },  // ya estaba bien
    { id: 20, nombre: 'Diego',      apellido: 'Ramirez', dni: '99887700' },  // duplicado de #16 -> 99887700
    { id: 21, nombre: 'Test',       apellido: 'Piloto',  dni: '40123456' },  // ya estaba bien
    { id: 25, nombre: 'Julio',      apellido: 'Leppen',  dni: '12345678' },  // 123456798 (9d) -> 12345678
];

const run = async () => {
    let applied = 0;
    let skipped = 0;
    for (const c of CHANGES) {
        const [rows] = await pool.query(
            `SELECT nombre, apellido, dni FROM piloto WHERE id_pilotos = ? AND deleted_at IS NULL`,
            [c.id]
        );
        if (!rows.length) {
            console.log(`[limpieza-pilotos] skip #${c.id} (no existe o soft-deleted)`);
            skipped++;
            continue;
        }
        const actual = rows[0];
        const sameNombre = actual.nombre === c.nombre;
        const sameApellido = actual.apellido === c.apellido;
        const sameDni = String(actual.dni) === String(c.dni);
        if (sameNombre && sameApellido && sameDni) {
            console.log(`[limpieza-pilotos] skip #${c.id} (ya limpio)`);
            skipped++;
            continue;
        }
        await pool.query(
            `UPDATE piloto SET nombre = ?, apellido = ?, dni = ? WHERE id_pilotos = ?`,
            [c.nombre, c.apellido, c.dni, c.id]
        );
        const cambios = [];
        if (!sameNombre)   cambios.push(`nombre '${actual.nombre}' -> '${c.nombre}'`);
        if (!sameApellido) cambios.push(`apellido '${actual.apellido}' -> '${c.apellido}'`);
        if (!sameDni)      cambios.push(`dni '${actual.dni}' -> '${c.dni}'`);
        console.log(`[limpieza-pilotos] update #${c.id}: ${cambios.join(', ')}`);
        applied++;
    }
    console.log(`\n[limpieza-pilotos] Listo. ${applied} actualizados, ${skipped} sin cambios.`);
    await pool.end();
};

run().catch((e) => { console.error(e); process.exit(1); });

