# Plan de continuación — Sesión siguiente

> Estado del proyecto: **Etapas 1, 2, 3, 4.1, 4.2, 4.3 completas**. Sistema funcional end-to-end con 6 entidades (Drones, Pilotos, Vuelos, Mantenimientos, Previstos, Modelos) y suite de smoke tests.
>
> Última sesión: 4.3D (dashboard) + commit `6f0f6f6` en `main`.

---

## 🎯 Opciones para la próxima sesión

| Opción | Qué cubre | Tiempo | Impacto |
|---|---|---|---|
| **A. Polish + UX** (Etapa 6) | Theme switcher, loading skeletons, error boundary, búsqueda global, export CSV | ~3-4 h | UX alto |
| **B. Quality / Testing** | CI workflow, fix smoke-test Connection-lost, fix TZ off-by-one, .gitignore, handoff cleanup | ~2-3 h | Estabilidad alta |
| **C. Deploy a producción** | Setup Railway para backend, configurar env vars, deploy + smoke test en vivo | ~2-3 h | Habilita uso real |
| **D. Polish selectivo** | Solo theme switcher + loading skeletons (lo más visible) | ~1-1.5 h | Quick win visual |

**Mi recomendación**: combinar **B** (primero, ~1.5h) → **D** (después, ~1h) → break → **A** (resto del polish).

---

## 📋 Plan detallado por opción

### Opción B — Quality / Testing (recomendado primero, ~1.5-2h)

#### B1. Fix del "Connection lost" en smoke tests (~30 min)
- **Síntoma**: tras varios minutos idle, el pool de MySQL de mysql2 se cae, el smoke test falla en TC-VUL-04/05 con "Cannot read properties of undefined".
- **Causa**: conexiones idle en Railway cierran por timeout. El pool no reintenta.
- **Fix**: agregar `enableKeepAlive: true` y reconnect logic en `src/config/database.js`. O usar `pool.on('connection', ...)` para reintentar en error transitorio.
- **Criterio de aceptación**: smoke test pasa 6/6 sin importar cuánto tiempo estuvo el server idle.

#### B2. Fix TZ off-by-one en fechas (~30 min)
- **Síntoma**: un vuelo creado con fecha `2026-06-23` se muestra como `2026-06-22` en el detail. Idem para mantenimiento, previsto.
- **Causa**: Node TZ ≠ MySQL TZ. Las DATETIME se almacenan naive pero se interpretan con TZ del proceso Node.
- **Fix opciones**:
  - A) Forzar TZ del proceso a UTC con `process.env.TZ = 'UTC'` en `src/app.js` (un cambio de 1 línea, no invasivo)
  - B) Cambiar columnas a `DATE` (no aplica para `datetime`)
  - C) Formatear fechas explícitamente en `formatDate()` (más invasivo)
- **Recomendación**: opción A. Una línea, fix global, sin tocar otras partes.
- **Criterio de aceptación**: `formatDate(fecha)` en cualquier vista devuelve la misma fecha que se envió en POST.

#### B3. `.gitignore` cleanup (~10 min)
- **Issue**: hay 20 imágenes `uploads/imagen-*.{png,jpeg,gif}` sin trackear. El directorio `uploads/` está en `.gitignore`? verificar.
- **Fix**:
  - Verificar `uploads/` en `.gitignore` (probablemente está — la app lo sirve estáticamente pero no commitea)
  - Limpiar archivos huérfanos: `rm uploads/imagen-*.{png,jpeg,gif}` o agregarlos a `.gitignore` explícitamente
  - Decidir: ¿queremos gitignorear `.opencode/` también?
- **Criterio de aceptación**: `git status` limpio, sin archivos spurious.

#### B4. Agregar `Plan/bugs-analisis.md` al repo (~5 min)
- **Issue**: el archivo existe y está actualizado, pero figura como untracked. Como documenta el estado de bugs, debería estar versionado.
- **Fix**: `git add Plan/bugs-analisis.md` + commit "docs: agregar bugs-analisis.md al repo"
- **Criterio de aceptación**: `git log -- Plan/bugs-analisis.md` muestra el commit.

#### B5. Documentar SSH key en `AGENTS.md` (~5 min)
- **Issue**: el SSH agent no carga la key `~/.ssh/Dell-LinuxMint` por defecto. Cada push requiere `GIT_SSH_COMMAND="ssh -i ~/.ssh/Dell-LinuxMint"`.
- **Fix**: agregar nota en `AGENTS.md` seccion "Remote / Auth" indicando que la key debe estar cargada con `ssh-add`, y el workaround con `GIT_SSH_COMMAND`.
- **Criterio de aceptación**: la nota está en AGENTS.md y un agente nuevo lo lee antes de pushear.

---

### Opción D — Polish selectivo (quick wins visuales, ~1-1.5h)

#### D1. Theme switcher en header (~30 min)
- **Estado actual**: `tokens.css` ya define `--data-theme="night"` y `--data-theme="desert"` además del default (Tactical Olive).
- **Plan**:
  - Agregar botón en el header (entre actions y logout)
  - Ciclar entre 3 temas al click
  - Persistir en `localStorage.setItem("vant.theme", theme)`
  - Aplicar en `app.js` al inicio: leer localStorage y setear `document.documentElement.dataset.theme`
- **Criterio de aceptación**: el botón cicla entre 3 temas, el estado persiste al recargar, los CSS variables se aplican.

#### D2. Loading skeletons (~30 min)
- **Estado actual**: las vistas usan `<span class="spinner"></span>` mientras cargan. Funciona pero es básico.
- **Plan**: agregar `<div class="skeleton skeleton--card"></div>` etc. en CSS, con animación shimmer. Usar en dashboards y list views mientras cargan catálogos.
- **Criterio de aceptación**: skeleton aparece brevemente, luego se reemplaza con contenido real. Sin "flash" de contenido vacío.

#### D3. Error boundary global en router (~20 min)
- **Estado actual**: si una vista tira excepción durante render, la app puede quedar en estado roto.
- **Plan**: envolver el `dispatch()` en `router.js` con try/catch. En catch, renderizar un error-banner global y log a console.
- **Criterio de aceptación**: forzar un error en una vista (e.g., retornar `null` accidentalmente) → usuario ve mensaje claro, app sigue funcionando al cambiar de ruta.

---

### Opción A — Polish completo (resto de Etapa 6, ~2-3h)

#### A1. Búsqueda global en dashboard (~45 min)
- **Plan**: input en el header con shortcuts. Busca contra drones (matricula), pilotos (nombre/dni), baterias (serie), vuelos (proposito). Resultados en dropdown.
- **Criterio de aceptación**: typing "ABC" filtra a items relevantes en <100ms.

#### A2. Export CSV desde listados (~1h)
- **Plan**: en `vuelos-list.js`, `drones-list.js`, `mantenimientos-list.js`, agregar botón "EXPORTAR CSV" en el headerActions. Genera un CSV client-side desde el array actual y lo descarga.
- **Criterio de aceptación**: el CSV se descarga, abre correctamente en Excel/LibreOffice con todas las columnas.

#### A3. Service worker (modo offline básico, ~1h)
- **Plan**: registrar `sw.js` que cachee `index.html`, `styles/*.css`, `scripts/main.js`. Network-first para la API, cache-first para assets. Mensaje "OFFLINE" si falla el fetch.
- **Criterio de aceptación**: con network caído, el dashboard se sigue mostrando (al menos la última versión cacheada).

---

### Opción C — Deploy a Railway (opcional, ~2-3h)

#### C1. Configurar Railway
- Crear servicio backend en Railway (Node.js)
- Conectar MySQL ya hosteada o usar plugin MySQL
- Setear env vars (`DB_*`, `JWT_SECRET`, `PORT`)
- Configurar start command: `node src/app.js`

#### C2. Verificar deploy
- `curl https://<railway>.up.railway.app/` → 200
- `curl https://<railway>.up.railway.app/api/vuelos -H "Authorization: Bearer ..."` → JSON
- Smoke test adaptado para apuntar a Railway en vez de localhost

#### C3. Actualizar README
- Sección "Deploy" con instrucciones paso a paso
- URL de producción

---

## 📌 Orden recomendado

```
Sesión 1 (mañana) — ~2h:
  Opción B1 (fix connection lost)        30 min
  Opción B2 (fix TZ off-by-one)         30 min
  Opción B3 (gitignore)                 10 min
  Opción B4 (commiteo bugs-analisis)     5 min
  Opción B5 (doc SSH en AGENTS.md)       5 min
  Opción D1 (theme switcher)            30 min   ← break visual

Sesión 2 (siguiente) — ~3-4h:
  Opción A1 (búsqueda global)           45 min
  Opción A2 (export CSV)                 1h
  Opción D2 (loading skeletons)         30 min
  Opción D3 (error boundary)             20 min
  Opción A3 (service worker)             1h
```

---

## 🔧 Snippets listos para usar

### B2 — Fix TZ (1 línea en `src/app.js`):
```js
process.env.TZ = 'UTC';
// ... existing code
const app = express();
```

### B1 — Pool keepAlive en `src/config/database.js`:
```js
export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});
pool.on('connection', (conn) => {
  conn.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('MySQL connection lost, will reconnect on next query');
    }
  });
});
```

### D1 — Theme switcher en `ui.js`:
```js
const THEMES = ['default', 'night', 'desert'];
export const getTheme = () => localStorage.getItem('vant.theme') || 'default';
export const setTheme = (t) => {
  localStorage.setItem('vant.theme', t);
  document.documentElement.dataset.theme = t;
};
// In renderShell headerActions, add:
// `<button class="btn btn--ghost btn--icon" id="btn-theme" title="Cambiar tema">${getThemeIcon()}</button>`
```

---

## 🧪 Testing strategy antes de cada cambio

1. `node --check <files>` para syntax
2. `node src/scripts/run-smoke-tests.js` para API (debe ser 6/6)
3. Browser smoke test: 1 happy path de la vista modificada
4. Visual screenshot si es cambio de UI

---

## 📦 Estado actual del repo (para referencia)

**Commits recientes** (del más nuevo al más viejo):
```
6f0f6f6  feat(dashboard):  4.3D
dec541f  feat(modelos):    4.3C
3f2e62b  feat(previstos):   4.3B
52e745e  feat(mantenimientos): 4.3A
841e313  fix(security):     B6 + B13 + B15
2d1d477  feat(vuelos):      4.2F
08c1978  polish(vuelos):    4.2E
acf7a89  feat(vuelos):      4.2D
ee6c56f  feat(vuelos):      4.2C
9844873  feat(vuelos):      4.2B
5c7053f  fix(security):     2 bugs from smoke tests
5dfca8f  feat(vuelos):      4.2A
```

**Pendientes low-priority** (no bloquean nada):
- B2, B8 ya fixeados (verificados)
- B14: XSS latente en renderShell (teórico, valores hardcoded)
- B16-B20: polish
- TZ off-by-one (bug pre-existente)
- Connection lost en smoke tests (pre-existente)

**Files untracked** (decidir qué hacer):
- `Plan/bugs-analisis.md` → commit (B4)
- `.opencode/` → gitignore
- `uploads/imagen-*.{png,jpeg,gif}` → gitignore explícito o limpieza
