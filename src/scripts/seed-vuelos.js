import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const ADMIN_ID = 16;
const ADMIN_TOKEN = jwt.sign({ id: ADMIN_ID, rol: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

const [drones] = await pool.query("SELECT id_dron FROM dron WHERE deleted_at IS NULL ORDER BY id_dron LIMIT 5");
const [bats] = await pool.query("SELECT id_bateria FROM bateria WHERE deleted_at IS NULL ORDER BY id_bateria LIMIT 5");
const [pils] = await pool.query("SELECT id_pilotos FROM piloto WHERE deleted_at IS NULL ORDER BY id_pilotos LIMIT 5");

const seed = [
    {
        fecha: '2026-06-01', coordenadas: '-34.6037,-58.3816', tiempo_de_vuelo: '00:25:00',
        proposito: 'Inspección termica zona industrial', clima: 'Despejado',
        observaciones: 'Vuelo de calibracion de camara', previsto_id: 1,
        drones: [drones[0].id_dron], baterias: [bats[0].id_bateria], pilotos: [pils[0].id_pilotos]
    },
    {
        fecha: '2026-06-03', coordenadas: '-34.6118,-58.3960', tiempo_de_vuelo: '00:45:00',
        proposito: 'Relevamiento topografico', clima: 'Parcialmente Nublado',
        observaciones: 'Sin novedades', drones: [drones[1 % drones.length].id_dron],
        baterias: [bats[1 % bats.length].id_bateria, bats[2 % bats.length].id_bateria],
        pilotos: [pils[1 % pils.length].id_pilotos]
    },
    {
        fecha: '2026-06-05', coordenadas: '-34.5895,-58.3974', tiempo_de_vuelo: '01:10:00',
        proposito: 'Vigilancia perimetral', clima: 'Nublado',
        observaciones: 'Viento en aumento a partir del minuto 50', previsto_id: 2,
        drones: [drones[2 % drones.length].id_dron, drones[3 % drones.length].id_dron],
        baterias: [bats[3 % bats.length].id_bateria], pilotos: [pils[2 % pils.length].id_pilotos]
    },
    {
        fecha: '2026-06-07', coordenadas: '-34.6300,-58.3700', tiempo_de_vuelo: '00:30:00',
        proposito: 'Monitoreo de obra vial', clima: 'Lluvia Ligera',
        observaciones: 'Abortado por condiciones climaticas', drones: [drones[4 % drones.length].id_dron],
        baterias: [bats[4 % bats.length].id_bateria], pilotos: [pils[3 % pils.length].id_pilotos]
    },
    {
        fecha: '2026-06-08', coordenadas: '-34.6157,-58.4332', tiempo_de_vuelo: '00:55:00',
        proposito: 'Inspección de estructura', clima: 'Despejado',
        observaciones: 'Vuelo exitoso, sin incidentes',
        drones: [drones[0].id_dron, drones[1 % drones.length].id_dron],
        baterias: [bats[0].id_bateria, bats[1 % bats.length].id_bateria],
        pilotos: [pils[4 % pils.length].id_pilotos, pils[0].id_pilotos]
    }
];

console.log(`Seed: ${drones.length} drones, ${bats.length} baterias, ${pils.length} pilotos disponibles\n`);

let created = 0, failed = 0;
for (const [i, vuelo] of seed.entries()) {
    try {
        const res = await fetch('http://localhost:3000/api/vuelos', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(vuelo)
        });
        const data = await res.json();
        if (res.status === 201) {
            console.log(`[OK  ${i+1}] id_vuelo=${data.id_vuelo}  ${vuelo.fecha}  ${vuelo.tiempo_de_vuelo}  (${vuelo.proposito})`);
            created++;
        } else {
            console.log(`[ERR ${i+1}] status=${res.status}  ${JSON.stringify(data)}`);
            failed++;
        }
    } catch (e) {
        console.log(`[ERR ${i+1}] fetch fallo: ${e.message}`);
        failed++;
    }
}

console.log(`\nResumen: ${created} creados, ${failed} errores`);
await pool.end();
