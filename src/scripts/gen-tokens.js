import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const [rows] = await pool.query("SELECT id_pilotos, nombre, apellido, rol FROM piloto WHERE id_pilotos IN (1, 16) ORDER BY rol DESC");
console.log('Pilotos para tokens:');
console.table(rows);

const adminToken = jwt.sign({ id: 16, rol: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const userToken = jwt.sign({ id: 1, rol: 'Usuario' }, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('\nADMIN_TOKEN=' + adminToken);
console.log('\nUSER_TOKEN=' + userToken);

await pool.end();
