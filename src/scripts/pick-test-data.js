import { pool } from '../config/database.js';

const [admins] = await pool.query("SELECT id_pilotos, nombre, apellido, email, rol FROM piloto WHERE rol = 'Admin' LIMIT 5");
console.log('Admins encontrados:');
console.table(admins);

const [drones] = await pool.query("SELECT id_dron, matricula, horas_vuelo_acum FROM dron LIMIT 5");
console.log('\nDrones (primeros 5):');
console.table(drones);

const [bats] = await pool.query("SELECT id_bateria, numero_de_serie, ciclos_de_carga FROM bateria LIMIT 5");
console.log('\nBaterias (primeras 5):');
console.table(bats);

const [pils] = await pool.query("SELECT id_pilotos, nombre, apellido, horas_vuelo_acum FROM piloto LIMIT 5");
console.log('\nPilotos (primeros 5):');
console.table(pils);

const [prev] = await pool.query("SELECT id_previstos, nombre_clave FROM previstos WHERE deleted_at IS NULL LIMIT 3");
console.log('\nPrevistos activos (primeros 3):');
console.table(prev);

await pool.end();
