import { pool } from '../config/database.js';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SRC_DIR = join(__dirname, '..', '..', 'uploads', 'dron_modelos');
const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

const newName = (ext) => `imagen-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

const PLACE_PHOTO = async ({ file, modelo }) => {
    const src = join(SRC_DIR, file);
    if (!existsSync(src)) {
        console.log(`  ! no existe: ${file}`);
        return null;
    }
    const ext = extname(file).toLowerCase();
    const destName = newName(ext);
    copyFileSync(src, join(UPLOADS_DIR, destName));
    return destName;
};

const PLACE_CARICATURE = async ({ src, destName }) => {
    copyFileSync(src, join(UPLOADS_DIR, destName));
    return destName;
};

const run = async () => {
    console.log('[seed-fotos] Conectando a DB...');

    const [modelos] = await pool.query(`SELECT id_modelo_dron, modelo, fabricante FROM modelo_dron`);
    const modeloByName = new Map(modelos.map(m => [m.modelo.toLowerCase().trim(), m]));

    const [drones] = await pool.query(
        `SELECT id_dron, matricula, id_modelo_dron, imagen FROM dron WHERE deleted_at IS NULL ORDER BY id_dron`
    );

    console.log('\n[seed-fotos] === DRONES ===');
    const droneModelPhoto = {
        'matrice 3t':           'matrice 3d.jpeg',
        'matrice 30t':          'matrice 30t.jpeg',
        'matrice 300 rtk':      'matrice 300 rtk.jpeg',
        'air 2s':               'DJI Air 2s.jpeg',
        'mavic 3 enterprise':   'Mavic 3 enterprise.jpeg',
        'anafi usa':            'Parrot Anafi USA.jpeg',
    };

    // Una imagen se considera "valida" si existe Y es > 1KB (los placeholders
    // de pruebas anteriores son PNGs de 1x1 o 2x2 de 69-77 bytes).
    const MIN_VALID_BYTES = 1024;
    const resolveImage = (imgField) => {
        if (!imgField) return false;
        const localPath = join(UPLOADS_DIR, imgField);
        if (!existsSync(localPath)) return false;
        try {
            const { statSync } = require('node:fs');
            return statSync(localPath).size >= MIN_VALID_BYTES;
        } catch {
            return false;
        }
    };

    const droneUpdates = [];
    for (const [modelName, photoFile] of Object.entries(droneModelPhoto)) {
        const modelo = modeloByName.get(modelName);
        if (!modelo) {
            console.log(`  ! modelo no encontrado: "${modelName}"`);
            continue;
        }
        const filename = await PLACE_PHOTO({ file: photoFile, modelo: modelName });
        if (!filename) continue;
        const dronesDeEsteModelo = drones.filter(d => Number(d.id_modelo_dron) === Number(modelo.id_modelo_dron));
        if (!dronesDeEsteModelo.length) {
            console.log(`  ! no hay drones para modelo "${modelName}" (id=${modelo.id_modelo_dron})`);
            continue;
        }
        for (const d of dronesDeEsteModelo) {
            if (resolveImage(d.imagen)) {
                console.log(`  - dron #${d.id_dron} (${d.matricula}) ya tiene imagen valida (${d.imagen}), skip`);
                continue;
            }
            await pool.query(`UPDATE dron SET imagen = ? WHERE id_dron = ?`, [filename, d.id_dron]);
            droneUpdates.push({ dron: `${d.id_dron}/${d.matricula}`, modelo: modelName, file: filename });
            console.log(`  OK dron #${d.id_dron} (${d.matricula}) <- ${photoFile} -> ${filename}`);
        }
    }

    console.log('\n[seed-fotos] === PILOTOS ===');
    const [pilotos] = await pool.query(
        `SELECT id_pilotos, nombre, apellido FROM piloto WHERE deleted_at IS NULL ORDER BY id_pilotos`
    );
    console.log(`  ${pilotos.length} pilotos encontrados:`);
    pilotos.forEach(p => console.log(`    #${p.id_pilotos} ${p.nombre} ${p.apellido}`));

    const CROP_DIR = '/tmp/opencode/vant-pilotos-crop';
    const assignments = [
        { pilotoId: 1,  src: 'piloto-gem-01-engineer.png', role: 'ingeniera (lab coat + dron)' },
        { pilotoId: 2,  src: 'piloto-gem-02-turbine.png',  role: 'turbine inspector (militar)' },
        { pilotoId: 3,  src: 'piloto-gem-03-sar.png',      role: 'SAR search (orange)' },
        { pilotoId: 4,  src: 'piloto-gem-04-marine.png',   role: 'marine biologist (wetsuit)' },
        { pilotoId: 5,  src: 'piloto-thumb-01-city.png',   role: 'FPV city (cabello azul)' },
        { pilotoId: 6,  src: 'piloto-thumb-02-jungle.png', role: 'jungle (anteojos)' },
        { pilotoId: 7,  src: 'piloto-thumb-03-sea.png',    role: 'stormy sea (rubia)' },
        { pilotoId: 8,  src: 'piloto-thumb-04-arctic.png', role: 'arctic (casco azul)' },
    ];

    const pilotoUpdates = [];
    for (const a of assignments) {
        const piloto = pilotos.find(p => Number(p.id_pilotos) === Number(a.pilotoId));
        if (!piloto) {
            console.log(`  ! piloto #${a.pilotoId} no existe, skip`);
            continue;
        }
        const src = join(CROP_DIR, a.src);
        if (!existsSync(src)) {
            console.log(`  ! source no existe: ${a.src}`);
            continue;
        }
        const ext = extname(a.src);
        const filename = newName(ext);
        await PLACE_CARICATURE({ src, destName: filename });
        await pool.query(`UPDATE piloto SET imagen = ? WHERE id_pilotos = ?`, [filename, a.pilotoId]);
        pilotoUpdates.push({ piloto: `${piloto.nombre} ${piloto.apellido}`, role: a.role, file: filename });
        console.log(`  OK piloto #${a.pilotoId} (${piloto.nombre} ${piloto.apellido}) <- ${a.role} -> ${filename}`);
    }

    console.log('\n[seed-fotos] === RESUMEN ===');
    console.log(`  Drones actualizados:  ${droneUpdates.length}`);
    console.log(`  Pilotos actualizados: ${pilotoUpdates.length}`);

    await pool.end();
};

run().catch((e) => { console.error(e); process.exit(1); });
