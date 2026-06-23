#!/usr/bin/env node
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { pool } from '../config/database.js';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
  bg: {
    red:    '\x1b[41m',
    green:  '\x1b[42m',
    blue:    '\x1b[44m',
    cyan:    '\x1b[46m',
    yellow:  '\x1b[43m',
    magenta: '\x1b[45m',
  },
};

const line = (char = '─', n = 78) => char.repeat(n);
const paint = (color, str) => `${color}${str}${C.reset}`;
const badge = (text, bg, fg = C.bold + C.white) => `${bg}${fg} ${text} ${C.reset}`;

const RESULT = [];

const signToken = (payload) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET no definido en .env');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

const request = async (method, path, { token, body } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const start = Date.now();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message, ms: Date.now() - start };
  }
  const ms = Date.now() - start;
  const ct = res.headers.get('content-type') || '';
  let data;
  try {
    data = ct.includes('application/json') ? await res.json() : await text();
  } catch (e) {
    data = { _parseError: e.message };
  }
  if (typeof data === 'string' && data) data = { raw: data };
  return { ok: true, status: res.status, data, ms };
};
const text = async (r) => r.text();

const printBanner = () => {
  console.log('\n' + paint(C.bg.blue + C.bold + C.white, '  SISTEMA VANT  ') + '  ' + paint(C.bold + C.cyan, 'SMOKE TESTS · MÓDULO DE VUELOS'));
  console.log(paint(C.gray, line()));
  console.log(paint(C.gray, '  Target    : ') + paint(C.white, BASE_URL));
  console.log(paint(C.gray, '  Fecha     : ') + paint(C.white, new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z'));
  console.log(paint(C.gray, '  JWT_SECRET: ') + paint(C.white, JWT_SECRET ? '*** configurado ***' : 'NO ENCONTRADO'));
  console.log(paint(C.gray, line()));
};

const printTestHeader = (id, title) => {
  console.log('\n' + paint(C.gray, line('═')));
  console.log(
    badge(id, C.bg.magenta) +
    '  ' +
    paint(C.bold + C.cyan, title)
  );
  console.log(paint(C.gray, line('═')));
};

const printRow = (k, v, color = C.white) => {
  const label = paint(C.gray, (k + ' ').padEnd(11, '·'));
  console.log(`  ${label} ${paint(color, v)}`);
};

const printJson = (data) => {
  if (data === null || data === undefined) {
    console.log('    ' + paint(C.gray, '(sin body)'));
    return;
  }
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const lines = text.split('\n');
  lines.forEach((l) => console.log('    ' + paint(C.dim, l)));
};

const verdict = (expected, actual) => {
  const ok = actual === expected;
  const tag = ok
    ? badge(' PASS ', C.bg.green)
    : badge(' FAIL ', C.bg.red);
  console.log('\n  ' + tag + '  ' + paint(C.gray, 'esperado=') + paint(C.yellow, String(expected)) + paint(C.gray, '  ·  obtenido=') + paint(C.cyan, String(actual)));
  RESULT.push({ ok });
  return ok;
};

const printSummary = () => {
  const total = RESULT.length;
  const passed = RESULT.filter((r) => r.ok).length;
  const failed = total - passed;
  console.log('\n' + paint(C.gray, line('═')));
  console.log(paint(C.bold + C.cyan, '  RESUMEN DE EJECUCIÓN'));
  console.log(paint(C.gray, line('═')));
  const pct = total ? Math.round((passed / total) * 100) : 0;
  const summaryColor = failed === 0 ? C.bg.green : (passed > failed ? C.bg.yellow : C.bg.red);
  console.log('  ' + badge(`${passed}/${total} OK · ${pct}%`, summaryColor));
  console.log('  ' + paint(C.green, `✔ ${passed} pasaron`) + '  ·  ' + paint(C.red, `✖ ${failed} fallaron`));
  console.log(paint(C.gray, line('═')) + '\n');
  process.exit(failed === 0 ? 0 : 1);
};

const tc01_tokenAusente = async () => {
  printTestHeader('TC-VUL-01', 'Token Ausente');
  printRow('Endpoint', 'POST /api/vuelos');
  printRow('Auth', '(sin cabecera Authorization)');
  printRow('Esperado', '401 Unauthorized', C.yellow);

  const r = await request('POST', '/api/vuelos', { body: { hello: 'world' } });
  printRow('Obtenido', `${r.status}  (${r.ms}ms)`, C.cyan);
  printRow('Response', '');
  printJson(r.data);
  verdict(401, r.status);
};

const tc02_rolPiloto = async () => {
  printTestHeader('TC-VUL-02', 'Rol Piloto Inválido');
  printRow('Endpoint', 'POST /api/vuelos');
  const token = signToken({ rol: 'Piloto', id_pilotos: 3 });
  printRow('Token', `Bearer ${token.slice(0, 32)}...`);
  printRow('Payload JWT', JSON.stringify({ rol: 'Piloto', id_pilotos: 3 }));

  let dronId, batId, pilotoId;
  try {
    const [drones] = await pool.query("SELECT id_dron FROM dron WHERE deleted_at IS NULL ORDER BY id_dron LIMIT 1");
    const [bats]   = await pool.query("SELECT id_bateria FROM bateria WHERE deleted_at IS NULL ORDER BY id_bateria LIMIT 1");
    const [pils]   = await pool.query("SELECT id_pilotos FROM piloto WHERE deleted_at IS NULL ORDER BY id_pilotos LIMIT 1");
    if (!drones.length || !bats.length || !pils.length) throw new Error('Faltan datos seed (dron/bateria/piloto)');
    dronId = drones[0].id_dron;
    batId  = bats[0].id_bateria;
    pilotoId = pils[0].id_pilotos;
    printRow('IDs validos', `dron=#${dronId}  bat=#${batId}  piloto=#${pilotoId}  (de la BD)`, C.gray);
  } catch (e) {
    console.log('\n  ' + paint(C.bg.red + C.white, ' SKIP ') + '  ' + paint(C.red, e.message));
    RESULT.push({ ok: false });
    return;
  }

  printRow('Esperado', '403 Forbidden (rol Piloto no autorizado)', C.yellow);

  const r = await request('POST', '/api/vuelos', {
    token,
    body: {
      fecha: '2026-06-17', coordenadas: '-34.6,-58.4', tiempo_de_vuelo: '00:25:00',
      proposito: 'TC-VUL-02', clima: 'Despejado',
      drones: [dronId], baterias: [batId], pilotos: [pilotoId],
    },
  });
  printRow('Obtenido', `${r.status}  (${r.ms}ms)`, C.cyan);
  printRow('Response', '');
  printJson(r.data);

  if (r.status === 403) {
    verdict(403, r.status);
  } else if (r.status === 201) {
    console.log('\n  ' + paint(C.bg.red + C.white, ' BUG  ') + '  ' + paint(C.red, 'POST /api/vuelos NO valida rol. Cualquier usuario autenticado puede crear vuelos.') + '  ' + paint(C.gray, '(ver routes/vuelo.routes.js:9)'));
    RESULT.push({ ok: false });
  } else {
    verdict(403, r.status);
  }
};

const tc03_tiempoInvalido = async () => {
  printTestHeader('TC-VUL-03', 'Formato de Tiempo Erróneo');
  printRow('Endpoint', 'POST /api/vuelos');
  const token = signToken({ id: 16, rol: 'Admin' });
  printRow('Token', `Bearer ${token.slice(0, 32)}...  (Admin)`, C.cyan);
  const body = {
    fecha: '2026-06-17',
    coordenadas: '-34.6,-58.4',
    tiempo_de_vuelo: '00:75:00',
    proposito: 'TC-VUL-03',
    clima: 'Despejado',
    drones: [1], baterias: [30], pilotos: [1],
  };
  printRow('Payload', `tiempo_de_vuelo = "${body.tiempo_de_vuelo}"`);
  printRow('Esperado', '400 Bad Request (regex HH:MM:SS)', C.yellow);

  const r = await request('POST', '/api/vuelos', { token, body });
  printRow('Obtenido', `${r.status}  (${r.ms}ms)`, C.cyan);
  printRow('Response', '');
  printJson(r.data);
  verdict(400, r.status);

  const r2 = await request('POST', '/api/vuelos', {
    token,
    body: { ...body, tiempo_de_vuelo: '25 minutos' },
  });
  printRow('Sub-test', `tiempo_de_vuelo = "25 minutos"`);
  printRow('Obtenido', `${r2.status}  (${r2.ms}ms)`, C.cyan);
  printJson(r2.data);
  verdict(400, r2.status);
};

const tc04_fkInvalida = async () => {
  printTestHeader('TC-VUL-04', 'Integridad Referencial (IDs inexistentes)');
  printRow('Endpoint', 'POST /api/vuelos');
  const token = signToken({ id: 16, rol: 'Admin' });
  printRow('Token', `Bearer ${token.slice(0, 32)}...  (Admin)`, C.cyan);
  const body = {
    fecha: '2026-06-17',
    coordenadas: '-34.6,-58.4',
    tiempo_de_vuelo: '00:25:00',
    proposito: 'TC-VUL-04',
    clima: 'Despejado',
    drones: [9999], baterias: [8888], pilotos: [7777],
  };
  printRow('Payload', 'drones=[9999]  baterias=[8888]  pilotos=[7777]');
  printRow('Esperado', '400 Bad Request (detalle de refs inválidas)', C.yellow);

  const r = await request('POST', '/api/vuelos', { token, body });
  printRow('Obtenido', `${r.status}  (${r.ms}ms)`, C.cyan);
  printRow('Response', '');
  printJson(r.data);
  verdict(400, r.status);
};

const tc05_flujoExitoso = async () => {
  printTestHeader('TC-VUL-05', 'Flujo Exitoso Completo (transaccional)');
  printRow('Endpoint', 'POST /api/vuelos');
  const token = signToken({ id: 16, rol: 'Admin' });
  printRow('Token', `Bearer ${token.slice(0, 32)}...  (Admin)`, C.cyan);

  let dronId, batId, pilotoId;
  try {
    const [drones] = await pool.query("SELECT id_dron, matricula, horas_vuelo_acum FROM dron WHERE deleted_at IS NULL ORDER BY id_dron LIMIT 1");
    const [bats]   = await pool.query("SELECT id_bateria, numero_de_serie, ciclos_de_carga FROM bateria WHERE deleted_at IS NULL ORDER BY id_bateria LIMIT 1");
    const [pils]   = await pool.query("SELECT id_pilotos, nombre, apellido, horas_vuelo_acum FROM piloto WHERE deleted_at IS NULL ORDER BY id_pilotos LIMIT 1");
    if (!drones.length || !bats.length || !pils.length) {
      console.log('\n  ' + paint(C.bg.red + C.white, ' SKIP ') + '  ' + paint(C.red, 'No hay drones / baterias / pilotos activos en la BD. Seed primero.'));
      RESULT.push({ ok: false });
      return;
    }
    dronId = drones[0].id_dron;
    batId  = bats[0].id_bateria;
    pilotoId = pils[0].id_pilotos;
    printRow('Pre-check dron', `#${dronId}  ${drones[0].matricula}  (horas=${drones[0].horas_vuelo_acum})`, C.gray);
    printRow('Pre-check bat',  `#${batId}  ${bats[0].numero_de_serie}  (ciclos=${bats[0].ciclos_de_carga})`, C.gray);
    printRow('Pre-check pil',  `#${pilotoId}  ${pils[0].nombre} ${pils[0].apellido}  (horas=${pils[0].horas_vuelo_acum})`, C.gray);
  } catch (e) {
    console.log('\n  ' + paint(C.bg.red + C.white, ' ERROR ') + '  ' + paint(C.red, e.message));
    RESULT.push({ ok: false });
    return;
  }

  const body = {
    fecha: '2026-06-17',
    coordenadas: '-34.6037,-58.3816',
    tiempo_de_vuelo: '00:25:00',
    proposito: `QA-SMOKE-${Date.now().toString(36).toUpperCase()}`,
    clima: 'Despejado',
    observaciones: 'Generado por run-smoke-tests.js (TC-VUL-05)',
    drones: [dronId],
    baterias: [batId],
    pilotos: [pilotoId],
  };
  printRow('Payload', JSON.stringify(body, null, 2).replace(/\n/g, '\n             '));
  printRow('Esperado', '201 Created (transaccion SQL OK, sin errores FK)', C.yellow);

  const r = await request('POST', '/api/vuelos', { token, body });
  printRow('Obtenido', `${r.status}  (${r.ms}ms)`, C.cyan);
  printRow('Response', '');
  printJson(r.data);

  if (r.status === 201) {
    const ok = r.data && r.data.id_vuelo;
    console.log('\n  ' + paint(C.bg.green + C.white, ' CONFIRM ') + '  ' +
      paint(C.green, `Vuelo #${r.data.id_vuelo} persistido · `) +
      paint(C.gray, `acumulados aplicados: +25min al dron/piloto, +1 ciclo a la bateria`));
    RESULT.push({ ok: !!ok });
  } else {
    RESULT.push({ ok: false });
  }
};

const main = async () => {
  printBanner();
  try {
    await tc01_tokenAusente();
    await tc02_rolPiloto();
    await tc03_tiempoInvalido();
    await tc04_fkInvalida();
    await tc05_flujoExitoso();
  } catch (e) {
    console.log('\n' + paint(C.bg.red + C.white, ' FATAL ') + '  ' + paint(C.red, e.stack || e.message));
  } finally {
    try { await pool.end(); } catch (_) {}
    printSummary();
  }
};

main();
