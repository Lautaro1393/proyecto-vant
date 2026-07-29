// Genera el snapshot estatico de la landing page.
// Corre contra la BD y escribe frontend/assets/data/landing-snapshot.json
// para que la landing pueda servirse aunque la BD este caida.
//
// Uso:
//   npm run snapshot
//
// En Railway, agregar como preDeployCommand:
//   npm run snapshot

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStats, getTopDrones, getTopPilotos } from '../models/public.model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'frontend', 'assets', 'data', 'landing-snapshot.json');

const main = async () => {
  const t0 = Date.now();
  console.log('[snapshot] Consultando BD...');
  const [stats, top_drones, top_pilotos] = await Promise.all([
    getStats(),
    getTopDrones(3),
    getTopPilotos(3),
  ]);
  const snapshot = {
    version: 1,
    generated_at: new Date().toISOString(),
    stats,
    top_drones,
    top_pilotos,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  const ms = Date.now() - t0;
  console.log(`[snapshot] OK (${ms}ms): ${OUT}`);
  console.log(`[snapshot]   ${stats.total_drones} drones · ${stats.total_pilotos} pilotos · ${stats.total_vuelos} vuelos · ${top_drones.length} top drones · ${top_pilotos.length} top pilotos`);
  process.exit(0);
};

main().catch((e) => {
  console.error('[snapshot] FAIL:', e.message);
  process.exit(1);
});
